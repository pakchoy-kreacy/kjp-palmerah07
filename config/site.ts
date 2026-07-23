export type RegistrationStatus = "OPEN" | "CLOSED";

export interface SiteConfig {
  school: {
    name: string;
    whatsappNumber: string;
  };
  app: {
    name: string;
    version: string;
  };
  links: {
    nisnCheckUrl: string;
  };
  announcement: {
    enabled: boolean;
    text: string;
  };
  appearance: {
    useSchoolBackground: boolean;
    showAnnouncement: boolean;
  };
}

export const siteConfig: SiteConfig = {
  school: {
    name: "SDN Palmerah 07 Pagi",
    whatsappNumber: "6285814328683",
  },
  app: {
    name: "Portal Pendataan KJP Plus",
    version: "1.0.0",
  },
  links: {
    nisnCheckUrl: "",
  },
  announcement: {
    enabled: true,
    text: "Pendaftaran dibuka tanggal 1 - 31 Juli 2025",
  },
  appearance: {
    useSchoolBackground: true,
    showAnnouncement: true,
  },
};
