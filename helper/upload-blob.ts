import { put } from "@vercel/blob";

/**
 * Vercel / production: set `BLOB_READ_WRITE_TOKEN` (Vercel Dashboard → Storage → Blob → Connect).
 * Without it on Vercel, local `public/` writes fail (read-only filesystem).
 */
export function isBlobUploadConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export async function putPublicBlob(pathname: string, file: File): Promise<string> {
  const blob = await put(pathname, file, { access: "public" });
  return blob.url;
}
