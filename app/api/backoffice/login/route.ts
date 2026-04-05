/**
 * Admin login: reads credentials from MongoDB collection `users` (`models/user.js`).
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectDB } from "@/helper/db";
import { User } from "@/models/user";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
} from "@/helper/admin-session";
import { ensureDefaultAdmin } from "@/helper/default-admin-seed";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureDefaultAdmin();
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
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    const stored = user.password as string;
    const ok = await bcrypt.compare(password, stored);
    if (!ok) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    const token = createAdminSessionToken(String(user._id));
    const jar = await cookies();
    jar.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login fail.";
    if (message.includes("ADMIN_SESSION_SECRET")) {
      return NextResponse.json({ error: "Server config incomplete." }, { status: 500 });
    }
    if (message.includes("MONGO_DB_URL")) {
      return NextResponse.json({ error: "Database not configured." }, { status: 500 });
    }
    console.error(e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
