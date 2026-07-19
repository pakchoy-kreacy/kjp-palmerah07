"use client";

import { Megaphone } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Announcement() {
  if (!siteConfig.appearance.showAnnouncement) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs font-medium text-amber-800">
      <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
      <span>{siteConfig.announcement.text}</span>
    </div>
  );
}
