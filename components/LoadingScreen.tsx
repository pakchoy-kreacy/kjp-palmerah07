"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

export function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const duration = 1200;
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
          setTimeout(onFinish, 250);
        }, 150);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-250 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: "linear-gradient(135deg, #DC2626 0%, #991B1B 50%, #7F1D1D 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-5">
        <img
          src="/assets/logo.png"
          alt={siteConfig.school.name}
          className="h-20 w-20 rounded-full object-cover shadow-[0_0_30px_rgba(255,255,255,0.2)] ring-2 ring-white/20"
          onError={(e) => {
            (e.currentTarget).style.display = "none";
            const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (fb) fb.style.display = "flex";
          }}
        />
        <div className="hidden h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white">
          KJP
        </div>

        <div className="text-center">
          <h1 className="text-lg font-bold text-white tracking-tight">{siteConfig.app.name}</h1>
          <p className="mt-0.5 text-xs font-medium text-white/60">{siteConfig.school.name}</p>
        </div>

        <div className="w-36">
          <div className="h-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all duration-100 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
