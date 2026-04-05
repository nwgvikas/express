import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { isBlobUploadConfigured, putPublicBlob } from "@/helper/upload-blob";

const LOGO_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const FAVICON_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
};

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const MAX_FAVICON_BYTES = 512 * 1024;

function inferExt(file: File, kind: "logo" | "favicon"): string | null {
  const map = kind === "logo" ? LOGO_MIME : FAVICON_MIME;
  if (map[file.type]) return map[file.type];
  const n = file.name.toLowerCase();
  if (n.endsWith(".ico")) return ".ico";
  if (n.endsWith(".svg")) return ".svg";
  if (n.endsWith(".png")) return ".png";
  if (n.endsWith(".webp")) return ".webp";
  if (kind === "logo" && (n.endsWith(".jpg") || n.endsWith(".jpeg"))) return ".jpg";
  if (kind === "logo" && n.endsWith(".gif")) return ".gif";
  return null;
}

export async function saveBrandingFile(
  file: File,
  kind: "logo" | "favicon",
): Promise<{ ok: true; publicPath: string } | { ok: false; error: string }> {
  if (!file.size) {
    return { ok: false, error: "File is empty" };
  }
  const max = kind === "logo" ? MAX_LOGO_BYTES : MAX_FAVICON_BYTES;
  if (file.size > max) {
    return {
      ok: false,
      error:
        kind === "logo"
          ? "Logo must be smaller than 2MB"
          : "Favicon must be smaller than 512KB",
    };
  }
  const ext = inferExt(file, kind);
  if (!ext) {
    return {
      ok: false,
      error:
        kind === "logo"
          ? "Logo: JPEG, PNG, WebP, or GIF"
          : "Favicon: PNG, ICO, SVG, or WebP",
    };
  }

  const name = `${kind}-${randomUUID()}${ext}`;

  if (isBlobUploadConfigured()) {
    try {
      const url = await putPublicBlob(`branding/${name}`, file);
      return { ok: true, publicPath: url };
    } catch (e) {
      console.error("saveBrandingFile blob:", e);
      return {
        ok: false,
        error: "Upload failed — check Vercel Blob (Storage) and BLOB_READ_WRITE_TOKEN.",
      };
    }
  }

  if (process.env.VERCEL) {
    return {
      ok: false,
      error:
        "File upload needs Vercel Blob: Dashboard → Storage → Blob → Create & connect to this project.",
    };
  }

  const dir = path.join(process.cwd(), "public", "uploads", "branding");
  await mkdir(dir, { recursive: true });
  const abs = path.join(dir, name);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, buf);
  return { ok: true, publicPath: `/uploads/branding/${name}` };
}
