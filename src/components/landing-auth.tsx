"use client";

import { useRecaptcha } from "@/components/recaptcha-provider";
import ReCAPTCHA from "react-google-recaptcha";
import { AuthButton } from "./auth-button";

export function LandingAuth() {
  const { isVerified, setIsVerified } = useRecaptcha();

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  function onReCAPTCHAChange(token: string | null) {
    if (token) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  // If in development mode or no site key is provided, just show the auth button (development fallback)
  if (isDevelopment || !siteKey || siteKey === "your_recaptcha_site_key_here") {
    return (
      <div className="flex flex-col items-center gap-4">
        {isDevelopment ? (
          <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-2 rounded border border-amber-200 dark:border-amber-900">
            ⚠️ CAPTCHA is bypassed in local development mode
          </p>
        ) : (
          <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-2 rounded border border-amber-200 dark:border-amber-900">
            ⚠️ Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to .env to enable the CAPTCHA
          </p>
        )}
        <AuthButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <ReCAPTCHA
        sitekey={siteKey}
        onChange={onReCAPTCHAChange}
      />
      
      <div className={`transition-opacity duration-300 ${isVerified ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
        <AuthButton />
      </div>
      
      {!isVerified && (
        <p className="text-sm text-slate-500">Please verify you are human to sign in.</p>
      )}
    </div>
  );
}
