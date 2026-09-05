"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function Loader({ className }: { className?: string }) {
  return (
    <motion.span
      className={cn("inline-block rounded-full border-2 border-current border-t-transparent", className)}
      style={{
        width: "1em",
        height: "1em"
      }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  )
}
