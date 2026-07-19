import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 py-4 text-center text-xs text-white/40">
      <p>{siteConfig.app.name}</p>
      <p className="mt-0.5">
        {siteConfig.school.name} &middot; v{siteConfig.app.version}
      </p>
      <p className="mt-0.5">
        &copy; {new Date().getFullYear()} Hak Cipta Dilindungi
      </p>
    </footer>
  );
}
