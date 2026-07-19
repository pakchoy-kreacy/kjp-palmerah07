import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-white/8 py-2.5 text-center text-[11px] text-white/35">
      <p>{siteConfig.app.name} &middot; {siteConfig.school.name} &middot; v{siteConfig.app.version}</p>
    </footer>
  );
}
