/** Reverse proxy / CDN ke peeche asli client IP (views, likes). */
export function clientIpFromHeaders(h: Headers): string {
  const xf = h.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  const cf = h.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  return "unknown";
}
