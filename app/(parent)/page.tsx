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
      if (seen) {
        setState("select");
      } else {
        sessionStorage.setItem("splash-seen", "true");
      }
    }
  }, []);

  const handleFinishLoading = React.useCallback(() => {
    setState("select");
  }, []);

  return (
    <>
      {state === "loading" && <LoadingScreen onFinish={handleFinishLoading} />}

      <GradientBackground>
        <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 px-5 py-8">
          <div className="animate-fade-in text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.png"
              alt={siteConfig.school.name}
              className="mx-auto h-20 w-20 rounded-full object-cover shadow-lg shadow-black/30"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div className="mx-auto hidden h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white shadow-lg">
              KJP
            </div>

            <h1 className="mt-4 text-2xl font-bold text-white">
              {siteConfig.app.name}
            </h1>
            <p className="mt-1 text-sm text-white/60">
              {siteConfig.school.name}
            </p>
          </div>

          <Announcement />

          <GlassCard>
            {state === "select" && (
              <LoginSelector
                onSelectParent={() => setState("parent-login")}
                onSelectAdmin={() => setState("admin-login")}
              />
            )}

            {state === "parent-login" && (
              <ParentLoginForm onBack={() => setState("select")} />
            )}

            {state === "admin-login" && (
              <AdminLoginForm onBack={() => setState("select")} />
            )}
          </GlassCard>
        </main>
        <Footer />
      </GradientBackground>
    </>
  );
}
