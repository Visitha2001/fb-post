import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SessionProvider } from "@/components/session-provider";
import { AuthButton } from "@/components/auth-button";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FB Influencer App",
  description: "AI Facebook Influencer Post Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans font-[family-name:var(--font-inter)] min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <nav className="flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm border-b dark:border-slate-800 transition-colors sticky top-0 z-50">
              <div className="font-bold text-2xl tracking-tight text-blue-600 dark:text-blue-500 font-[family-name:var(--font-outfit)]">
                AI Influencer
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <AuthButton />
              </div>
            </nav>
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
