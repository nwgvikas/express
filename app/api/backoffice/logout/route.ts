import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/helper/admin-session";

export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  jar.delete({ name: ADMIN_SESSION_COOKIE, path: "/" });
  return NextResponse.json({ ok: true });
}
