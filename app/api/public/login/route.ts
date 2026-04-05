/**
 * Public member login — `users` with `role: user` only (admin → `/backoffice/login`).
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getPublicSiteAuthSettings } from "@/helper/admin-settings-service";
import { connectDB } from "@/helper/db";
import { User } from "@/models/user";
import { USER_SESSION_COOKIE, createUserSessionToken } from "@/helper/user-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await getPublicSiteAuthSettings();
    if (!auth.loginEnabled) {
      return NextResponse.json(
        { error: "Sign-in is disabled — contact the administrator." },
        { status: 403 },
      );
    }

    const body = (await req.json()) as { email?: string; password?: string };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    await connectDB();
    const user = await User.findOne({ email }).lean();
    if (!user || user.role !== "user") {
      return NextResponse.json(
        {
          error:
            "Account not found or this is an admin account — admins should use /backoffice/login.",
        },
        { status: 401 },
      );
    }

    const stored = user.password as string;
    const ok = await bcrypt.compare(password, stored);
    if (!ok) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    const token = createUserSessionToken(String(user._id));
    const jar = await cookies();
    jar.set(USER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    return NextResponse.json({
      ok: true,
      user: {
        name: user.name || "",
        email: user.email,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login fail.";
    if (message.includes("SESSION_SECRET")) {
      return NextResponse.json({ error: "Server config incomplete." }, { status: 500 });
    }
    console.error("public login:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
