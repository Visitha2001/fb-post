import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WorkspaceClient } from "@/components/workspace-client";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function WorkspacePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  const initialFaces = (user?.savedFaces || []).map((f: any) => ({
    id: f.id,
    frontUrl: f.frontUrl,
    sideUrl: f.sideUrl
  }));

  return (
    <div className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col items-center">
      <div className="mb-10 text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-outfit)]">
          AI Influencer Studio
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
          Manage your AI faces and construct viral posts seamlessly.
        </p>
      </div>

      <div className="w-full">
        <WorkspaceClient initialFaces={initialFaces} />
      </div>
    </div>
  );
}
