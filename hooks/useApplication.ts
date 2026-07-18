"use client";

import { useQuery } from "@tanstack/react-query";

export interface ApplicationPayload {
  application: any;
  studentData: any;
  guardianData: any;
  emergencyContact: any;
  formFields: { field_key: string; section: string; is_enabled: boolean }[];
  documentTypes: any[];
  documents: any[];
}

async function fetchApplication(): Promise<ApplicationPayload> {
  const res = await fetch("/api/application");
  if (!res.ok) throw new Error("Gagal memuat data");
  return res.json();
}

export function useApplication() {
  return useQuery({
    queryKey: ["application"],
    queryFn: fetchApplication,
  });
}
