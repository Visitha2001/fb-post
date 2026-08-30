import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      title, 
      language, 
      style, 
      clothing, 
      background, 
      description, 
      aspectRatio,
      faceUrl 
    } = await req.json();

    // 1. Generate Image Mock using Pollinations
    let seed = Math.floor(Math.random() * 1000000);
    const width = aspectRatio === "16:9" ? 1024 : aspectRatio === "4:5" ? 768 : 1024;
    const height = aspectRatio === "16:9" ? 576 : aspectRatio === "4:5" ? 960 : 1024;
    
    let imagePrompt = `Photorealistic portrait of a person wearing ${clothing}, at ${background}, ${style} style, highly detailed, 8k resolution, raw photo, lifelike.`;
    
    if (faceUrl && faceUrl.includes("pollinations.ai")) {
      try {
        const urlObj = new URL(faceUrl);
        const urlSeed = urlObj.searchParams.get("seed");
        if (urlSeed) seed = parseInt(urlSeed, 10);
        
        const pathParts = urlObj.pathname.split("/prompt/");
        if (pathParts.length > 1) {
          const originalPrompt = decodeURIComponent(pathParts[1].split("?")[0]);
          // Clean up the original prompt (remove plain background instructions)
          const basePrompt = originalPrompt.replace(/plain solid bright green background, green screen/g, "").replace(/looking straight at camera, front view,/g, "");
          imagePrompt = `${basePrompt}, wearing ${clothing}, at ${background}, ${style} style.`;
        }
      } catch (e) {
        console.error("Failed to parse faceUrl for seed/prompt", e);
      }
    }

    if (description) {
       imagePrompt += ` Context: ${description}`;
    }

    const encodedPrompt = encodeURIComponent(imagePrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=${width}&height=${height}&nologo=true`;

    // Fetch the image to pass it to Gemini
    let finalImageUrl = "";
    let imageBase64 = "";
    const imageRes = await fetch(imageUrl);
    
    if (!imageRes.ok) {
      console.warn("Pollinations API failed or rate-limited. Using fallback image.");
      // Fallback to a placeholder image (using a generic base64 or Unsplash)
      // Since we need base64 for Gemini, we'll fetch a static placeholder or just use a small 1x1 grey pixel
      const fallbackPixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      imageBase64 = fallbackPixel;
      finalImageUrl = `data:image/png;base64,${fallbackPixel}`;
    } else {
      const imageBuf = await imageRes.arrayBuffer();
      imageBase64 = Buffer.from(imageBuf).toString('base64');
      finalImageUrl = `data:image/jpeg;base64,${imageBase64}`;
    }

    // 2. Generate Description and Hashtags using Gemini Vision
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.warn("Missing GOOGLE_GENERATIVE_AI_API_KEY. Returning default text.");
      return NextResponse.json({ 
        imageUrl: finalImageUrl,
        generatedText: `${description}\n\n#AIInfluencer #GeneratedPost`
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const textPrompt = `
You are an expert social media manager.
Based on the provided image and the user's short instructions below, write a highly engaging Facebook post description. 
Include suitable, real Facebook hashtags.
Ensure the response is exclusively in this language: ${language}.
Do NOT output any conversational filler or "Here is the post...". Output ONLY the final post text.

User's short instructions/title: ${title}. ${description}
    `;

    const result = await model.generateContent([
      textPrompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const generatedText = result.response.text();

    return NextResponse.json({ 
      imageUrl: finalImageUrl,
      generatedText
    });

  } catch (error: any) {
    console.error("Generate Post Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate post" }, { status: 500 });
  }
}
