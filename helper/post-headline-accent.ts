/**
 * Har post ke headline ke peeche alag rang — seed stable rahe (id + slug).
 * Classes yahin literal honi chahiyein taaki Tailwind JIT unhe bundle kare.
 */
const HEADLINE_BACKGROUNDS = [
  "bg-gradient-to-br from-emerald-600 to-teal-800",
  "bg-gradient-to-br from-violet-600 to-indigo-800",
  "bg-gradient-to-br from-rose-600 to-orange-700",
  "bg-gradient-to-br from-sky-600 to-blue-800",
  "bg-gradient-to-br from-amber-600 to-red-700",
  "bg-gradient-to-br from-fuchsia-600 to-purple-800",
  "bg-gradient-to-br from-cyan-600 to-emerald-800",
  "bg-gradient-to-br from-indigo-600 to-slate-800",
  "bg-gradient-to-br from-teal-600 to-cyan-800",
  "bg-gradient-to-br from-orange-600 to-amber-800",
  "bg-gradient-to-br from-pink-600 to-rose-800",
  "bg-gradient-to-br from-blue-600 to-indigo-900",
] as const;

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function postHeadlineBackgroundClass(seed: string): string {
  const s = seed.trim() || "default";
  const idx = hashSeed(s) % HEADLINE_BACKGROUNDS.length;
  return HEADLINE_BACKGROUNDS[idx];
}
