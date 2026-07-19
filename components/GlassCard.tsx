"use client";

import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`animate-scale-in w-full rounded-2xl border border-white/15 bg-white/8 p-4 shadow-lg shadow-black/15 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
