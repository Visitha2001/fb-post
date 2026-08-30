"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-9 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-full"></div>;
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full overflow-hidden border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-all outline-none focus:ring-2 focus:ring-blue-500">
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 flex items-center justify-center rounded-full">
              <User className="h-5 w-5 text-slate-500" />
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
            </div>
          </div>
          <div className="-mx-1 my-1 h-px bg-slate-200 dark:bg-slate-800" />
          <DropdownMenuItem onClick={() => signOut()} className="text-red-600 dark:text-red-400 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={() => signIn("google")}>
      Sign In
    </Button>
  );
}
