import { siteConfig } from "@/config/site";

export function Announcement() {
  if (!siteConfig.appearance.showAnnouncement) return null;

  return (
    <div className="animate-fade-in w-full max-w-sm rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-center text-sm text-yellow-200 shadow-lg shadow-black/10 backdrop-blur-sm">
      {siteConfig.announcement.text}
    </div>
  );
}
