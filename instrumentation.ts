export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDefaultAdmin } = await import("@/helper/default-admin-seed");
    try {
      await ensureDefaultAdmin();
    } catch (e) {
      console.error("[instrumentation] ensureDefaultAdmin:", e);
    }
  }
}
