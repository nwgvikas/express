import { cookies } from "next/headers";
import { connectDB } from "@/helper/db";
import { User } from "@/models/user";
import { USER_SESSION_COOKIE, parseUserSessionToken } from "@/helper/user-session";

export type PublicSiteUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
};

export async function getPublicSiteUser(): Promise<PublicSiteUser | null> {
  const jar = await cookies();
  const token = jar.get(USER_SESSION_COOKIE)?.value;
  const session = token ? parseUserSessionToken(token) : null;
  if (!session) return null;
  await connectDB();
  const user = await User.findById(session.sub).select("name email mobile role").lean();
  if (!user || user.role !== "user") return null;
  return {
    id: String(user._id),
    name: typeof user.name === "string" ? user.name : "",
    email: typeof user.email === "string" ? user.email : "",
    mobile: typeof user.mobile === "string" ? user.mobile : "",
  };
}
