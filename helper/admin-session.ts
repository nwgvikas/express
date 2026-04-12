import { createHmac, timingSafeEqual } from "crypto";


export const ADMIN_SESSION_COOKIE = "backoffice_session";

function getSecret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET?.trim();
  if (s) return s;
  // Local dev: avoid "Server config incomplete" if .env is missing (not for production).
  if (process.env.NODE_ENV === "development") {
    return "dev-only-unnao-backoffice-session-secret";
  }
  return null;
}

export function createAdminSessionToken(userId: string): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function parseAdminSessionToken(
  token: string,
): { sub: string } | null {
  const secret = getSecret();
  if (!secret) return null;
  try {
    const dot = token.indexOf(".");
    if (dot <= 0) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    if (!payload || !sig) return null;
    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");
    if (expected.length !== sig.length) return null;
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
      return null;
    }
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { sub?: string; exp?: number };
    if (typeof data.exp !== "number" || typeof data.sub !== "string") {
      return null;
    }
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: data.sub };
  } catch {
    return null;
  }
}
