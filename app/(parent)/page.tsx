"use client";

import * as React from "react";
import { siteConfig } from "@/config/site";
import { LoadingScreen } from "@/components/LoadingScreen";
import { GradientBackground } from "@/components/GradientBackground";
import { GlassCard } from "@/components/GlassCard";
import { LoginSelector } from "@/components/LoginSelector";
import { ParentLoginForm } from "@/components/ParentLoginForm";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { Announcement } from "@/components/Announcement";
import { Footer } from "@/components/Footer";

type PageState = "loading" | "select" | "parent-login" | "admin-login";

export default function LandingPage() {
  const [state, setState] = React.useState<PageState>("loading");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("splash-seen");
      if (seen) setState("select");
      else sessionStorage.setItem("splash-seen", "true");
    }
  }, []);

  const handleFinishLoading = React.useCallback(() => setState("select"), []);

  return (
    <>
      {state === "loading" && <LoadingScreen onFinish={handleFinishLoading} />}

      <GradientBackground>
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-3">
          <div className="animate-fade-in text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.png"
              alt={siteConfig.school.name}
              className="mx-auto h-16 w-16 rounded-full object-cover shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              onError={(e) => {
                (e.currentTarget).style.display = "none";
                const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }}
            />
            <div className="mx-auto hidden h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white shadow-lg">
              KJP
            </div>

            <h1 className="mt-2.5 text-xl font-extrabold text-white tracking-tight">
              {siteConfig.app.name}
            </h1>
            <p className="mt-0.5 text-xs font-semibold text-white/65">
              {siteConfig.school.name}
            </p>
          </div>

          <div className="mt-3">
            <Announcement />
          </div>

          <div className="mt-3 w-full max-w-xs">
            <GlassCard>
              {state === "select" && <LoginSelector onSelectParent={() => setState("parent-login")} onSelectAdmin={() => setState("admin-login")} />}
              {state === "parent-login" && <ParentLoginForm onBack={() => setState("select")} />}
              {state === "admin-login" && <AdminLoginForm onBack={() => setState("select")} />}
            </GlassCard>
          </div>
        </main>
        <Footer />
      </GradientBackground>
    </>
  );
}
