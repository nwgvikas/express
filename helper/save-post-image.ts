import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_BYTES = 5 * 1024 * 1024;

export async function savePostImageFile(
  file: File,
): Promise<{ ok: true; publicPath: string } | { ok: false; error: string }> {
  if (!file.size) {
    return { ok: false, error: "File is empty" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Image must be 5MB or smaller" };
  }
  const ext = MIME_EXT[file.type];
  if (!ext) {
    return { ok: false, error: "Only JPEG, PNG, WebP, or GIF" };
  }

  const dir = path.join(process.cwd(), "public", "uploads", "posts");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}${ext}`;
  const abs = path.join(dir, name);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, buf);
  return { ok: true, publicPath: `/uploads/posts/${name}` };
}
