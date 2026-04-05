import { createHmac, timingSafeEqual } from "crypto";

export const USER_SESSION_COOKIE = "site_user_session";

function getSecret(): string | null {
  const s =
    process.env.USER_SESSION_SECRET?.trim() || process.env.ADMIN_SESSION_SECRET?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === "development") {
    return "dev-only-unnao-backoffice-session-secret";
  }
  return null;
}

/** Public site member session — payload mein `typ: "user"` taake admin cookie se mix na ho. */
export function createUserSessionToken(userId: string): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error("USER_SESSION_SECRET or ADMIN_SESSION_SECRET is not set");
  }
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14;
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp, typ: "user" }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function parseUserSessionToken(token: string): { sub: string } | null {
  const secret = getSecret();
  if (!secret) return null;
  try {
    const dot = token.indexOf(".");
    if (dot <= 0) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    if (!payload || !sig) return null;
    const expected = createHmac("sha256", secret).update(payload).digest("base64url");
    if (expected.length !== sig.length) return null;
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
      return null;
    }
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: string;
      exp?: number;
      typ?: string;
    };
    if (data.typ !== "user") return null;
    if (typeof data.exp !== "number" || typeof data.sub !== "string") {
      return null;
    }
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: data.sub };
  } catch {
    return null;
  }
}
