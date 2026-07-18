import { SettingsNav } from "@/components/admin/settings/SettingsNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pengaturan</h1>
      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <div className="border-b md:border-b-0 md:border-r md:pr-2">
          <SettingsNav />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
