import { siteConfig } from "@/config/site";

export function Announcement() {
  if (!siteConfig.appearance.showAnnouncement) return null;

  return (
    <div className="animate-fade-in w-full max-w-xs rounded-xl border border-yellow-400/15 bg-yellow-400/8 px-3 py-2 text-center text-xs font-medium text-yellow-200/90 shadow-sm shadow-black/10 backdrop-blur-sm">
      {siteConfig.announcement.text}
    </div>
  );
}
