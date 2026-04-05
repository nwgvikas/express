import { NextResponse } from "next/server";
import { USER_SESSION_COOKIE } from "@/helper/user-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL("/", request.url);
  const res = NextResponse.redirect(url);
  res.cookies.set(USER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
