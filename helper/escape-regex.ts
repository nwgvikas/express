/** Safe string for Mongo `$regex` / JS `RegExp` from user input. */
export function escapeRegexForMongo(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
