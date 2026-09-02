"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface RecaptchaContextType {
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
}

const RecaptchaContext = createContext<RecaptchaContextType | undefined>(undefined);

export function RecaptchaProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  return (
    <RecaptchaContext.Provider value={{ isVerified, setIsVerified }}>
      {children}
    </RecaptchaContext.Provider>
  );
}

export function useRecaptcha() {
  const context = useContext(RecaptchaContext);
  if (context === undefined) {
    throw new Error("useRecaptcha must be used within a RecaptchaProvider");
  }
  return context;
}
