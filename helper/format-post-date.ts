const kolkata: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
};

/** en-IN style, fixed Asia/Kolkata — server & client same string for same ISO input (avoids hydration drift). */
export function formatPostDateEnIn(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", {
      ...kolkata,
      second: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
}

/** Comments list — same timezone, no seconds (matches previous card comment lines). */
export function formatCommentDateEnIn(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", kolkata).format(d);
  } catch {
    return "";
  }
}
