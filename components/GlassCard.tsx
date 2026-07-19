"use client";

import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`animate-scale-in w-full rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
