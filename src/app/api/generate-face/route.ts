import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFaceGenerationPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.HUGGING_FACE_API_KEY) {
      return NextResponse.json({ error: "Missing HUGGING_FACE_API_KEY." }, { status: 500 });
    }

    const { gender, prompt } = await req.json();

    const { frontPrompt, sidePrompt } = getFaceGenerationPrompt(gender, prompt);

    const generateImage = async (imagePrompt: string) => {
      const res = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: imagePrompt }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Hugging Face API error: ${res.status} ${errorText}`);
      }

      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return `data:image/jpeg;base64,${base64}`;
    };

    // Generate Front View
    const frontImage = await generateImage(frontPrompt);

    // Generate Side View
    const sideImage = await generateImage(sidePrompt);

    return NextResponse.json({
      frontImage,
      sideImage,
    });

  } catch (error: any) {
    console.error("Generate Face Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate face via Hugging Face" }, { status: 500 });
  }
}
