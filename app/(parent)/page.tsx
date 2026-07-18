import { getPublicSettings } from "@/lib/settings";
import { LoginForm } from "@/components/parent/LoginForm";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const settings = await getPublicSettings();
  const isClosed = settings.registrationStatus === "CLOSED";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      {settings.schoolLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.schoolLogo}
          alt="Logo sekolah"
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          KJP
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{settings.landingTitle}</h1>
        {settings.landingSubtitle && (
          <p className="text-sm text-muted-foreground">
            {settings.landingSubtitle}
          </p>
        )}
      </div>

      {settings.announcementBanner && (
        <div className="w-full rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          {settings.announcementBanner}
        </div>
      )}

      {isClosed ? (
        <div className="w-full rounded-md border border-border bg-muted p-6 text-center">
          <p className="text-base font-medium">Pendataan telah ditutup.</p>
        </div>
      ) : (
        <LoginForm />
      )}
    </main>
  );
}
