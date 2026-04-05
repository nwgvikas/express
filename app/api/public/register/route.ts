/**
 * Public user signup — `users` collection, role `user`.
 * Admin setting `registerEnabled` off hone par 403.
 */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPublicSiteAuthSettings } from "@/helper/admin-settings-service";
import { connectDB } from "@/helper/db";
import { normalizeIndianMobile } from "@/helper/indian-mobile";
import { User } from "@/models/user";

export const dynamic = "force-dynamic";

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const auth = await getPublicSiteAuthSettings();
    if (!auth.registerEnabled) {
      const msg =
        auth.registerOffMessage?.trim() ||
        "New registrations are disabled — turned off by admin.";
      return NextResponse.json({ error: msg }, { status: 403 });
    }

    const body = (await req.json()) as {
      name?: string;
      email?: string;
      mobile?: string;
      password?: string;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const mobileRaw = typeof body.mobile === "string" ? body.mobile : "";
    const mobile = normalizeIndianMobile(mobileRaw);

    if (name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!mobile) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit mobile (starts with 6–9, +91 optional)." },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password kam se kam 8 characters ka ho." },
        { status: 400 },
      );
    }

    await connectDB();
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      mobile,
      password: hash,
      role: "user",
    });

    return NextResponse.json({ ok: true, message: "Registration successful." });
  } catch (e: unknown) {
    const err = e as { code?: number | string; message?: string };
    if (err?.code === 11000 || err?.code === "11000") {
      const m = String(err.message || "");
      if (m.includes("mobile") || m.includes("Mobile")) {
        return NextResponse.json(
          { error: "This mobile number is already registered — try another." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "An account with this email already exists — try another email." },
        { status: 409 },
      );
    }
    console.error("public register:", e);
    return NextResponse.json({ error: "Registration failed — please try again." }, { status: 500 });
  }
}
