import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  parseAdminSessionToken,
} from "@/helper/admin-session";

export const dynamic = "force-dynamic";

export default async function BackofficeIndexPage() {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? parseAdminSessionToken(token) : null;
  if (session) {
    redirect("/backoffice/dashboard");
  }
  redirect("/backoffice/login");
}
