"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

export function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const duration = 1500;
    const interval = 16;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const p = Math.min((step / steps) * 100, 100);
      setProgress(p);

      if (p >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setVisible(false);
          setTimeout(onFinish, 300);
        }, 200);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background:
          "linear-gradient(135deg, #DC2626 0%, #991B1B 50%, #000000 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.png"
            alt={siteConfig.school.name}
            className="h-24 w-24 rounded-full object-cover shadow-lg"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div
            className="hidden h-24 w-24 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white"
          >
            KJP
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            {siteConfig.app.name}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {siteConfig.school.name}
          </p>
        </div>

        <div className="w-48">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-white/50">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}
