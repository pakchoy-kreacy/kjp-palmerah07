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
import { Clock } from "lucide-react";

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
        <main className="flex flex-1 items-center justify-center px-4 py-4">
          <GlassCard className="animate-fade-in mx-auto w-full max-w-sm">
            {/* Logo */}
            <div className="flex justify-center">
              <img
                src="/assets/logo.png"
                alt={siteConfig.school.name}
                className="h-12 w-12 rounded-full object-cover shadow-md ring-2 ring-white"
                onError={(e) => {
                  (e.currentTarget).style.display = "none";
                  const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (fb) fb.style.display = "flex";
                }}
              />
              <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-red-100 text-base font-bold text-red-700">
                KJP
              </div>
            </div>

            {/* Title */}
            <div className="mt-3 text-center">
              <h1 className="text-base font-bold text-gray-900">{siteConfig.app.name}</h1>
              <p className="mt-0.5 text-xs font-semibold text-gray-600">{siteConfig.school.name}</p>
              <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-medium text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Estimasi: 8-10 menit</span>
              </div>
            </div>

            {/* Announcement */}
            <div className="mt-3">
              <Announcement />
            </div>

            {/* Login */}
            <div className="mt-3">
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
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <Footer />
            </div>
          </GlassCard>
        </main>
      </GradientBackground>
    </>
  );
}
