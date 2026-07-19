"use client";

import { siteConfig } from "@/config/site";

export function GradientBackground({ children }: { children: React.ReactNode }) {
  const bgImage = siteConfig.appearance.useSchoolBackground
    ? "/assets/bg-school.jpg"
    : null;

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #DC2626 0%, #991B1B 45%, #1a0000 75%, #000000 100%)",
      }}
    >
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${bgImage}')`,
            opacity: 0.08,
            filter: "blur(4px)",
          }}
        />
      )}

      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-red-700/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-64 w-64 rounded-full border border-red-400/10" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full border border-red-500/5" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
