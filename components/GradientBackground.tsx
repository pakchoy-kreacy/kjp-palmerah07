"use client";

import { siteConfig } from "@/config/site";

export function GradientBackground({ children }: { children: React.ReactNode }) {
  const bgImage = siteConfig.appearance.useSchoolBackground
    ? "/assets/bg-school.jpg"
    : null;

  return (
    <>
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(160deg, #DC2626 0%, #B91C1C 30%, #991B1B 60%, #7F1D1D 85%, #450a0a 100%)",
        }}
      >
        {bgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${bgImage}')`,
              opacity: 0.18,
              filter: "blur(2px)",
            }}
          />
        )}

        <div className="pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-red-400/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[35rem] w-[35rem] rounded-full bg-red-600/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-rose-500/6 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 bottom-1/4 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />

        <div className="pointer-events-none absolute left-[10%] top-[15%] h-48 w-48 rounded-full border border-red-300/8" />
        <div className="pointer-events-none absolute right-[15%] top-[10%] h-32 w-32 rounded-full border border-rose-400/6" />
        <div className="pointer-events-none absolute left-[20%] bottom-[20%] h-40 w-40 rounded-full border border-red-500/5" />
        <div className="pointer-events-none absolute right-[8%] bottom-[30%] h-56 w-56 rounded-full border border-red-400/6" />

        <div className="pointer-events-none absolute left-[30%] top-[20%] h-2 w-2 rounded-full bg-white/8" />
        <div className="pointer-events-none absolute right-[25%] top-[35%] h-1.5 w-1.5 rounded-full bg-white/6" />
        <div className="pointer-events-none absolute left-[15%] bottom-[40%] h-2 w-2 rounded-full bg-white/8" />
        <div className="pointer-events-none absolute right-[35%] bottom-[15%] h-1.5 w-1.5 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute left-[55%] top-[12%] h-1 w-1 rounded-full bg-white/8" />
        <div className="pointer-events-none absolute right-[60%] top-[60%] h-2 w-2 rounded-full bg-white/6" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
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
