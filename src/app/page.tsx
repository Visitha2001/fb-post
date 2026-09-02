import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingAuth } from "@/components/landing-auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/workspace");
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 dark:text-white tracking-tight">
        Create Viral <span className="text-blue-600 dark:text-blue-400">AI Influencer</span> Posts
      </h1>
      <p className="text-lg md:text-xl mb-10 max-w-2xl text-slate-600 dark:text-slate-300">
        Generate photorealistic faces, construct detailed prompts, and instantly create stunning Facebook posts in seconds. Log in to get started.
      </p>
      
      <div className="scale-100 md:scale-110">
        <LandingAuth />
      </div>
    </div>
  );
}
