import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ faces: user.savedFaces || [] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch faces" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, frontUrl, sideUrl } = await req.json();
    if (!id || !frontUrl || !sideUrl) return NextResponse.json({ error: "Missing properties" }, { status: 400 });

    await dbConnect();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $push: { savedFaces: { id, frontUrl, sideUrl } } },
      { new: true }
    );

    return NextResponse.json({ faces: user?.savedFaces || [] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save face collection" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });

    await dbConnect();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $pull: { savedFaces: { id } } },
      { new: true }
    );

    return NextResponse.json({ faces: user?.savedFaces || [] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete face collection" }, { status: 500 });
  }
}
