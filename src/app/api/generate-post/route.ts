import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPostImagePrompt, getSocialMediaTextPrompt, getFaceDescriptionPrompt } from "@/lib/prompts";

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
      faceUrl,
    } = await req.json();

    if (!faceUrl) {
      return NextResponse.json(
        { error: "A face identity must be selected. Face URL is missing or not accessible." },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    // ──────────────────────────────────────────────
    // STEP 1: Fetch the selected face image
    // ──────────────────────────────────────────────
    let faceImageBase64 = "";
    let faceMimeType = "image/jpeg";

    if (faceUrl.startsWith("data:")) {
      const matches = faceUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        faceMimeType = matches[1];
        faceImageBase64 = matches[2];
      }
    } else {
      const faceRes = await fetch(faceUrl);
      if (!faceRes.ok) {
        return NextResponse.json(
          { error: "Face URL is not accessible. Could not fetch the selected face image." },
          { status: 400 }
        );
      }
      const faceBuf = await faceRes.arrayBuffer();
      faceImageBase64 = Buffer.from(faceBuf).toString("base64");
      const contentType = faceRes.headers.get("content-type");
      if (contentType) faceMimeType = contentType;
    }

    if (!faceImageBase64) {
      return NextResponse.json(
        { error: "Could not process the selected face image." },
        { status: 400 }
      );
    }

    // Helper function for retrying Gemini calls on 503 errors
    const generateWithRetry = async (promptData: any, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await model.generateContent(promptData);
        } catch (err: any) {
          if (err.status === 503 || err.message?.includes('503')) {
            if (i === retries - 1) throw err;
            console.warn(`Gemini 503 Error. Retrying in ${2 ** i} seconds...`);
            await new Promise((res) => setTimeout(res, (2 ** i) * 1000));
          } else {
            throw err;
          }
        }
      }
      throw new Error("Failed to generate content after retries");
    };

    // ──────────────────────────────────────────────
    // STEP 2: Use Gemini Vision to analyze the face
    // ──────────────────────────────────────────────
    const faceDescriptionPrompt = getFaceDescriptionPrompt();

    const faceAnalysis = await generateWithRetry([
      faceDescriptionPrompt,
      {
        inlineData: {
          data: faceImageBase64,
          mimeType: faceMimeType,
        },
      },
    ]);

    let faceDescriptionRaw = faceAnalysis.response.text();
    let faceDescription = "";

    try {
      // Clean up markdown block if it exists
      const cleanJsonStr = faceDescriptionRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      const faceData = JSON.parse(cleanJsonStr);
      faceDescription = faceData.description;
    } catch (e) {
      console.warn("Failed to parse Gemini face description JSON. Using raw text.", e);
      faceDescription = faceDescriptionRaw;
    }
    console.log("Gemini Face Description:", faceDescription);

    // ──────────────────────────────────────────────
    // STEP 3: Generate post image using Hugging Face
    // ──────────────────────────────────────────────
    const encodedPrompt = getPostImagePrompt({
      clothing,
      background,
      style,
      description,
      faceDescription,
    });

    let finalImageUrl = "";
    let imageBase64 = "";

    try {
      if (!process.env.HUGGING_FACE_API_KEY) {
        throw new Error("Missing HUGGING_FACE_API_KEY.");
      }

      const res = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: encodedPrompt }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Hugging Face API error: ${res.status} ${errorText}`);
      }

      const buffer = await res.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString("base64");
      finalImageUrl = `data:image/jpeg;base64,${imageBase64}`;
    } catch (e) {
      console.warn("Hugging Face Image Generation failed. Using fallback.", e);
      const fallbackPixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      imageBase64 = fallbackPixel;
      finalImageUrl = `data:image/png;base64,${fallbackPixel}`;
    }

    // ──────────────────────────────────────────────
    // STEP 4: Generate post caption and hashtags
    // ──────────────────────────────────────────────
    const textPrompt = getSocialMediaTextPrompt(title, description, language);

    const textResult = await generateWithRetry([
      textPrompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const generatedText = textResult.response.text();

    return NextResponse.json({
      imageUrl: finalImageUrl,
      generatedText,
      faceDescription,
    });

  } catch (error: any) {
    console.error("Generate Post Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate post" },
      { status: 500 }
    );
  }
}
