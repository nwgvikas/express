import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  parseAdminSessionToken,
} from "@/helper/admin-session";

export async function requireBackofficeSession(): Promise<{ userId: string } | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? parseAdminSessionToken(token) : null;
  if (!session) return null;
  return { userId: session.sub };
}
