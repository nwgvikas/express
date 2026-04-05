import bcrypt from "bcryptjs";
import { connectDB } from "@/helper/db";
import { User } from "@/models/user";

/** Default credentials (override with DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD). */
export function getDefaultAdminEmail(): string {
  return (
    process.env.DEFAULT_ADMIN_EMAIL?.trim().toLowerCase() || "admin@gmail.com"
  );
}

export function getDefaultAdminPassword(): string {
  return process.env.DEFAULT_ADMIN_PASSWORD?.trim() || "admin1234";
}

/**
 * Ensures one default admin row exists in `users`. Safe to call on every server boot.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  if (!process.env.MONGO_DB_URL?.trim()) {
    return;
  }
  try {
    const email = getDefaultAdminEmail();
    const password = getDefaultAdminPassword();
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role !== "admin") {
        await User.updateOne({ _id: existing._id }, { $set: { role: "admin" } });
      }
      return;
    }
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      name: "Default Admin",
      email,
      password: hash,
      role: "admin",
    });
  } catch (e) {
    console.error("[ensureDefaultAdmin]", e);
  }
}
