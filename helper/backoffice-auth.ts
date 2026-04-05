import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  parseAdminSessionToken,
} from "@/helper/admin-session";
import { connectDB } from "@/helper/db";
import { User } from "@/models/user";

export const getBackofficeAdmin = cache(async () => {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? parseAdminSessionToken(token) : null;
  if (!session) {
    redirect("/backoffice/login");
  }

  await connectDB();
  const admin = await User.findById(session.sub).select("email name").lean();
  if (!admin) {
    redirect("/backoffice/login");
  }

  return {
    session,
    admin: {
      id: String(admin._id),
      email: admin.email as string,
      name: (admin.name as string) || "",
    },
  };
});
