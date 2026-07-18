import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const PARENT_SESSION_COOKIE = "kjp_parent_session";

export interface ParentSession {
  nisn: string;
  studentId: string;
  applicationId: string;
  periodId: string;
}

const secret = () => new TextEncoder().encode(process.env.PARENT_SESSION_SECRET!);

export async function signParentSession(
  session: ParentSession
): Promise<string> {
  return await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifyParentSession(
  token: string
): Promise<ParentSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      nisn: payload.nisn as string,
      studentId: payload.studentId as string,
      applicationId: payload.applicationId as string,
      periodId: payload.periodId as string,
    };
  } catch {
    return null;
  }
}

export async function getParentSession(): Promise<ParentSession | null> {
  const token = cookies().get(PARENT_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyParentSession(token);
}

export function setParentSessionCookie(token: string) {
  cookies().set(PARENT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearParentSessionCookie() {
  cookies().delete(PARENT_SESSION_COOKIE);
}
