"use client";

import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { AuthButton } from "./auth-button";

export function LandingAuth() {
  const [isVerified, setIsVerified] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  function onReCAPTCHAChange(token: string | null) {
    if (token) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  }

  // If no site key is provided yet, just show the auth button (development fallback)
  if (!siteKey || siteKey === "your_recaptcha_site_key_here") {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-2 rounded border border-amber-200 dark:border-amber-900">
          ⚠️ Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to .env to enable the CAPTCHA
        </p>
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
