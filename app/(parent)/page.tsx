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
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-2">
          <div className="animate-fade-in text-center">
            <img
              src="/assets/logo.png"
              alt={siteConfig.school.name}
              className="mx-auto h-14 w-14 rounded-full object-cover shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              onError={(e) => {
                (e.currentTarget).style.display = "none";
                const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }}
            />
            <div className="mx-auto hidden h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white shadow-lg">
              KJP
            </div>

            <h1 className="mt-2 text-xl font-extrabold text-white tracking-tight">
              {siteConfig.app.name}
            </h1>
            <p className="text-xs font-semibold text-white/65">
              {siteConfig.school.name}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-white/40">
              Estimasi waktu pengisian: 8-10 menit
            </p>
          </div>

          <div className="mt-2.5">
            <Announcement />
          </div>

          <div className="mt-2.5 w-full max-w-xs">
            <GlassCard>
              {state === "select" && <LoginSelector onSelectParent={() => setState("parent-login")} onSelectAdmin={() => setState("admin-login")} />}
              {state === "parent-login" && <ParentLoginForm onBack={() => setState("select")} />}
              {state === "admin-login" && <AdminLoginForm onBack={() => setState("select")} />}
            </GlassCard>
          </div>
        </main>
      </GradientBackground>
    </>
  );
}
