"use client";

import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="text-center text-[11px] text-gray-400">
      <p>&copy; {new Date().getFullYear()} {siteConfig.school.name}</p>
      <p className="mt-0.5 text-gray-300">v{siteConfig.app.version}</p>
    </footer>
  );
}
