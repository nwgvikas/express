import { NextResponse } from "next/server";
import {
  listAdminCommentsPaged,
  type AdminCommentListStatus,
} from "@/helper/backoffice-comment-service";
import { requireBackofficeSession } from "@/helper/backoffice-api-auth";

export const dynamic = "force-dynamic";

const STATUSES: AdminCommentListStatus[] = ["pending", "approved", "rejected", "spam", "all"];

function parseStatus(raw: string | null): AdminCommentListStatus {
  if (raw && STATUSES.includes(raw as AdminCommentListStatus)) {
    return raw as AdminCommentListStatus;
  }
  return "pending";
}

function parseIntParam(raw: string | null, fallback: number, min: number, max: number) {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function GET(request: Request) {
  const session = await requireBackofficeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = parseStatus(searchParams.get("status"));
    const page = parseIntParam(searchParams.get("page"), 1, 1, 10_000);
    const limit = parseIntParam(searchParams.get("limit"), 15, 5, 50);
    const q = (searchParams.get("q") ?? "").trim();

    const result = await listAdminCommentsPaged({ status, page, limit, q });
    return NextResponse.json(result);
  } catch (e) {
    console.error("GET /api/backoffice/comments:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
