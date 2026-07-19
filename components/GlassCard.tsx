"use client";

import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`animate-scale-in w-full rounded-3xl border border-white/50 bg-white/80 p-4 shadow-xl shadow-black/10 backdrop-blur-[20px] ${className}`}
    >
      {children}
    </div>
  );
}
