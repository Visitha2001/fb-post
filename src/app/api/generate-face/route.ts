import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gender, prompt } = await req.json();

    // NOTE: Free-tier Gemini keys typically do not have Imagen access yet.
    // For the UI to remain fully functional, we are simulating the generation 
    // using a highly realistic placeholder generator. 
    // In production with an Imagen-enabled key, you would call:
    /*
    import { GoogleGenerativeAI } from "@google/generative-ai";
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
    const result = await model.generateContent(`Generate a photorealistic ${gender} face. ${prompt}`);
    const base64Image = result.response.text(); 
    return NextResponse.json({ image: `data:image/jpeg;base64,${base64Image}` });
    */

    // MOCK RESPONSE -> Replaced with real open-source AI generation via Pollinations
    const seed = Math.floor(Math.random() * 1000000);
    
    // Construct robust prompts for consistency
    const basePrompt = `${prompt ? prompt + ', ' : ''}photorealistic studio portrait of a ${gender}, highly detailed, super realistic human being, 8k resolution, raw photo, lifelike, highly textured skin, natural lighting, intricate details`;
    const frontPrompt = encodeURIComponent(`${basePrompt}, looking straight at camera, front view, plain solid bright green background, green screen`);
    const sidePrompt = encodeURIComponent(`${basePrompt}, side profile view, plain solid bright green background, green screen`);

    const frontUrl = `https://image.pollinations.ai/prompt/${frontPrompt}?seed=${seed}&width=512&height=512&nologo=true`;
    const sideUrl = `https://image.pollinations.ai/prompt/${sidePrompt}?seed=${seed}&width=512&height=512&nologo=true`;
    
    // Fetch both images sequentially to prevent rate-limiting or concurrency drops
    const frontRes = await fetch(frontUrl);
    if (!frontRes.ok) throw new Error("Failed to generate front view");
    const frontBuf = await frontRes.arrayBuffer();
    const frontBase64 = Buffer.from(frontBuf).toString('base64');

    const sideRes = await fetch(sideUrl);
    if (!sideRes.ok) throw new Error("Failed to generate side view");
    const sideBuf = await sideRes.arrayBuffer();
    const sideBase64 = Buffer.from(sideBuf).toString('base64');

    return NextResponse.json({ 
      frontImage: `data:image/jpeg;base64,${frontBase64}`,
      sideImage: `data:image/jpeg;base64,${sideBase64}`
    });

  } catch (error) {
    console.error("Generate Face Error:", error);
    return NextResponse.json({ error: "Failed to generate face" }, { status: 500 });
  }
}
