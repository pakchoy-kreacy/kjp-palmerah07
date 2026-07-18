import { NextResponse } from "next/server";
import { clearParentSessionCookie } from "@/lib/parent-session";

export const dynamic = "force-dynamic";

export async function POST() {
  clearParentSessionCookie();
  return NextResponse.json({ ok: true });
}
