"use client";

import { siteConfig } from "@/config/site";

export function GradientBackground({ children }: { children: React.ReactNode }) {
  const bgImage = siteConfig.appearance.useSchoolBackground
    ? "/assets/bg-school.jpg"
    : null;

  return (
    <>
      <div className="fixed inset-0 -z-10">
        {bgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${bgImage}')`,
              filter: "blur(2px) brightness(0.85)",
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(220,38,38,0.75) 0%, rgba(153,27,27,0.85) 40%, rgba(127,29,29,0.9) 70%, rgba(69,10,10,0.95) 100%)",
          }}
        />
      </div>
      <div className="relative flex min-h-screen flex-col">
        {children}
      </div>
    </>
  );
}
