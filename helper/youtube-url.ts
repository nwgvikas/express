/**
 * Extract YouTube video id from common URL shapes.
 */
export function parseYoutubeVideoId(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;

  try {
    if (t.includes("youtube.com") || t.includes("youtu.be")) {
      const u = new URL(t.startsWith("http") ? t : `https://${t}`);
      if (u.hostname === "youtu.be") {
        const id = u.pathname.replace(/^\//, "").split("/")[0];
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
        const parts = u.pathname.split("/").filter(Boolean);
        const embedIdx = parts.indexOf("embed");
        if (embedIdx >= 0 && parts[embedIdx + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[embedIdx + 1])) {
          return parts[embedIdx + 1];
        }
        const shortIdx = parts.indexOf("shorts");
        if (shortIdx >= 0 && parts[shortIdx + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[shortIdx + 1])) {
          return parts[shortIdx + 1];
        }
      }
    }
  } catch {
    /* fall through to regex */
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m) return m[1];
  }
  return null;
}

export function canonicalYoutubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
