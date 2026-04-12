import { connectDB } from "@/helper/db";
import { User } from "@/models/user";

export type AdminUserListRow = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "user" | "admin";
  createdAt: string;
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Backoffice: saare `users` — admin + member; password expose nahi. */
export async function listUsersForAdmin(opts: {
  page: number;
  limit: number;
  q?: string;
}): Promise<{
  rows: AdminUserListRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = Math.max(1, Math.floor(opts.page) || 1);
  const limit = Math.min(100, Math.max(5, Math.floor(opts.limit) || 20));
  const skip = (page - 1) * limit;
  const q = (opts.q ?? "").trim();

  await connectDB();
  const filter: Record<string, unknown> = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ email: rx }, { name: rx }, { mobile: rx }];
  }

  const [total, docs] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name email mobile role createdAt")
      .lean(),
  ]);

  const rows: AdminUserListRow[] = docs.map((u) => {
    const roleRaw = (u as { role?: string }).role;
    const role: "user" | "admin" = roleRaw === "admin" ? "admin" : "user";
    const created = (u as { createdAt?: Date }).createdAt;
    return {
      id: String(u._id),
      name: typeof (u as { name?: string }).name === "string" ? String((u as { name: string }).name).trim() : "",
      email: typeof (u as { email?: string }).email === "string" ? String((u as { email: string }).email).trim() : "",
      mobile:
        typeof (u as { mobile?: string }).mobile === "string"
          ? String((u as { mobile: string }).mobile).trim()
          : "",
      role,
      createdAt: created ? new Date(created).toISOString() : "",
    };
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { rows, total, page, limit, totalPages };
}
