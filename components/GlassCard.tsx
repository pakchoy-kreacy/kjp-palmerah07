"use client";

import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`w-full rounded-2xl border border-white/60 bg-white/90 p-5 shadow-xl shadow-black/15 backdrop-blur-lg ${className}`}
    >
      {children}
    </div>
  );
}
