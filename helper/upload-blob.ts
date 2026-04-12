import { put } from "@vercel/blob";

/**
 * Primary: `BLOB_READ_WRITE_TOKEN` (Vercel Dashboard → Storage → Blob → Connect).
 * Fallback `express_READ_WRITE_TOKEN` supports legacy .env naming mistakes.
 */
function blobReadWriteToken(): string | undefined {
  const a = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (a) return a;
  const legacy = process.env.express_READ_WRITE_TOKEN?.trim();
  if (legacy) return legacy;
  return undefined;
}

/**
 * Vercel / production: set `BLOB_READ_WRITE_TOKEN` (Vercel Dashboard → Storage → Blob → Connect).
 * Without it on Vercel, local `public/` writes fail (read-only filesystem).
 */
export function isBlobUploadConfigured(): boolean {
  return Boolean(blobReadWriteToken());
}

function inferContentType(pathname: string, file: File): string {
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  const lower = pathname.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".ico")) return "image/x-icon";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

/** Best-effort message for any thrown value (some runtimes break `instanceof Error`). */
function extractErrorMessage(e: unknown): string {
  if (typeof e === "string" && e.trim()) {
    return e.trim();
  }
  if (e instanceof AggregateError && Array.isArray(e.errors) && e.errors.length > 0) {
    const parts = e.errors.map((x) => extractErrorMessage(x)).filter(Boolean);
    if (parts.length) {
      return parts.join("; ");
    }
  }
  if (e instanceof Error) {
    const m = e.message?.replace(/\s+/g, " ").trim();
    if (m) {
      return m;
    }
    const c = e.cause !== undefined ? extractErrorMessage(e.cause) : "";
    if (c) {
      return c;
    }
  }
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    const msg = o.message;
    if (typeof msg === "string" && msg.trim()) {
      return msg.trim();
    }
    const digest = o.digest;
    if (typeof digest === "string" && digest) {
      return `digest ${digest}`;
    }
    if (o.code != null && String(o.code)) {
      return `code ${String(o.code)}`;
    }
    const name = typeof o.name === "string" ? o.name : "";
    if (name && name !== "Error") {
      return name;
    }
  }
  if (e != null && typeof e !== "object") {
    return String(e);
  }
  try {
    const j = JSON.stringify(e);
    if (j && j !== "{}" && j !== "null") {
      return j.slice(0, 220);
    }
  } catch {
    /* ignore */
  }
  const ctor =
    e && typeof e === "object" && "constructor" in e && typeof (e as { constructor: unknown }).constructor === "function"
      ? (e as { constructor: { name?: string } }).constructor.name
      : "";
  if (ctor && ctor !== "Object") {
    return ctor;
  }
  return "";
}

/** User-visible message; includes API / runtime detail when available. */
export function formatBlobUploadError(e: unknown): string {
  const trimmed = extractErrorMessage(e).slice(0, 280);
  if (trimmed) {
    return `${trimmed} — verify BLOB_READ_WRITE_TOKEN (Vercel → Storage → Blob) for this environment.`;
  }
  return "Upload failed — check Vercel Blob (Storage) and BLOB_READ_WRITE_TOKEN.";
}

export async function putPublicBlob(pathname: string, file: File): Promise<string> {
  const token = blobReadWriteToken();
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }

  const body = Buffer.from(await file.arrayBuffer());
  const contentType = inferContentType(pathname, file);
  const multipart = body.length >= 4 * 1024 * 1024;

  const blob = await put(pathname, body, {
    access: "public",
    token,
    contentType,
    ...(multipart ? { multipart: true } : {}),
  });
  return blob.url;
}
