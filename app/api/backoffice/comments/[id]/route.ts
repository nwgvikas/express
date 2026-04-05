import { NextResponse } from "next/server";
import {
  applyCommentModeration,
  type ModerationAction,
} from "@/helper/backoffice-comment-service";
import { requireBackofficeSession } from "@/helper/backoffice-api-auth";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const ACTIONS: ModerationAction[] = ["approve", "reject", "spam"];

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireBackofficeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { action?: unknown };
  try {
    body = (await request.json()) as { action?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (!ACTIONS.includes(action as ModerationAction)) {
    return NextResponse.json(
      { error: "action is required: approve | reject | spam" },
      { status: 400 },
    );
  }

  const result = await applyCommentModeration(id.trim(), action as ModerationAction);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
