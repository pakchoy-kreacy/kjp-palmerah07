"use client";

import { siteConfig } from "@/config/site";

export function GradientBackground({ children }: { children: React.ReactNode }) {
  const bgImage = siteConfig.appearance.useSchoolBackground
    ? "/assets/bg-school.jpg"
    : null;

  return (
    <>
      <div className="fixed inset-0 z-0">
        {/* Base: school photo full opacity (or gradient if no photo) */}
        {bgImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${bgImage}')`,
              filter: "blur(3px)",
            }}
          />
        ) : null}

        {/* Red gradient overlay at 55% on top of photo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #DC2626 0%, #B91C1C 30%, #991B1B 60%, #7F1D1D 85%, #450a0a 100%)",
            opacity: bgImage ? 0.55 : 1,
          }}
        />

        {/* Subtle ornaments — smaller, lower opacity */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-red-400/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-red-600/8 blur-2xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/4 h-40 w-40 rounded-full bg-rose-500/5 blur-2xl" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-36 w-36 rounded-full bg-orange-500/4 blur-2xl" />

        <div className="pointer-events-none absolute left-[15%] top-[20%] h-24 w-24 rounded-full border border-red-300/6" />
        <div className="pointer-events-none absolute right-[20%] top-[15%] h-16 w-16 rounded-full border border-rose-400/4" />
        <div className="pointer-events-none absolute left-[25%] bottom-[25%] h-20 w-20 rounded-full border border-red-400/4" />

        {/* Noise */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </>
  );
}
