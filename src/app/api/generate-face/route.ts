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

    const { gender, prompt } = await req.json();

    const seed = Math.floor(Math.random() * 1000000);
    const { frontPrompt, sidePrompt } = getFaceGenerationPrompt(gender, prompt);

    const frontUrl = `https://image.pollinations.ai/prompt/${frontPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;
    const sideUrl = `https://image.pollinations.ai/prompt/${sidePrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;

    // Fetch both images sequentially
    const frontRes = await fetch(frontUrl);
    if (!frontRes.ok) throw new Error("Failed to generate front view");
    const frontBuf = await frontRes.arrayBuffer();
    const frontBase64 = Buffer.from(frontBuf).toString("base64");

    const sideRes = await fetch(sideUrl);
    if (!sideRes.ok) throw new Error("Failed to generate side view");
    const sideBuf = await sideRes.arrayBuffer();
    const sideBase64 = Buffer.from(sideBuf).toString("base64");

    return NextResponse.json({
      frontImage: `data:image/jpeg;base64,${frontBase64}`,
      sideImage: `data:image/jpeg;base64,${sideBase64}`,
    });

  } catch (error: any) {
    console.error("Generate Face Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate face" }, { status: 500 });
  }
}
