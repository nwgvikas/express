import mongoose from "mongoose";
import { connectDB } from "@/helper/db";
import { escapeRegexForMongo } from "@/helper/escape-regex";
import { syncPostApprovedCommentCount } from "@/helper/post-comment-count-sync";
import { PostComment } from "@/models/post-comment";

export type AdminCommentRow = {
  id: string;
  authorName: string;
  mobile: string;
  body: string;
  status: string;
  createdAt: string;
  postId: string;
  postTitle: string;
  postSlug: string;
};

export type AdminCommentListStatus = "pending" | "approved" | "rejected" | "spam" | "all";

export type ListAdminCommentsPagedResult = {
  comments: AdminCommentRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function listAdminCommentsPaged(params: {
  status: AdminCommentListStatus;
  page?: number;
  limit?: number;
  q?: string;
}): Promise<ListAdminCommentsPagedResult> {
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const limit = Math.min(500, Math.max(5, Math.floor(params.limit ?? 15)));
  const skip = (page - 1) * limit;
  const q = (params.q ?? "").trim();
  const status = params.status;

  await connectDB();
  const matchStatus = status === "all" ? {} : { status };
  const esc = q ? escapeRegexForMongo(q) : "";

  const pipeline: mongoose.PipelineStage[] = [
    { $match: matchStatus },
    {
      $lookup: {
        from: "posts",
        localField: "post",
        foreignField: "_id",
        as: "postDoc",
      },
    },
    { $unwind: { path: "$postDoc", preserveNullAndEmptyArrays: true } },
  ];

  if (esc) {
    pipeline.push({
      $match: {
        $or: [
          { body: { $regex: esc, $options: "i" } },
          { authorName: { $regex: esc, $options: "i" } },
          { mobile: { $regex: esc, $options: "i" } },
          { "postDoc.title": { $regex: esc, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({
    $facet: {
      meta: [{ $count: "total" }],
      data: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            authorName: 1,
            mobile: 1,
            body: 1,
            status: 1,
            createdAt: 1,
            post: 1,
            postTitle: "$postDoc.title",
            postSlug: "$postDoc.slug",
          },
        },
      ],
    },
  });

  type AggRow = {
    _id: mongoose.Types.ObjectId;
    authorName?: string;
    mobile?: string;
    body?: string;
    status?: string;
    createdAt?: Date;
    post?: mongoose.Types.ObjectId;
    postTitle?: string;
    postSlug?: string;
  };

  const agg = await PostComment.aggregate<{
    meta: { total: number }[];
    data: AggRow[];
  }>(pipeline);

  const fac = agg[0] ?? { meta: [], data: [] };
  const total = fac.meta[0]?.total ?? 0;
  const rows = fac.data ?? [];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const comments: AdminCommentRow[] = rows.map((r) => ({
    id: String(r._id),
    authorName: String(r.authorName ?? "").trim() || "—",
    mobile: String(r.mobile ?? ""),
    body: String(r.body ?? ""),
    status: String(r.status ?? ""),
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : "",
    postId: r.post ? String(r.post) : "",
    postTitle: String(r.postTitle ?? "").trim() || "(Post deleted?)",
    postSlug: String(r.postSlug ?? "").trim(),
  }));

  return { comments, total, page, limit, totalPages };
}

export async function listAdminComments(
  status: AdminCommentListStatus = "pending",
  limit = 200,
): Promise<AdminCommentRow[]> {
  const { comments } = await listAdminCommentsPaged({
    status,
    page: 1,
    limit: Math.min(500, Math.max(1, limit)),
    q: "",
  });
  return comments;
}

export type ModerationAction = "approve" | "reject" | "spam";

export async function applyCommentModeration(
  commentId: string,
  action: ModerationAction,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const id = commentId.trim();
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, error: "Invalid comment id", status: 400 };
  }

  const nextStatus: "approved" | "rejected" | "spam" =
    action === "approve" ? "approved" : action === "reject" ? "rejected" : "spam";

  await connectDB();
  const doc = await PostComment.findById(id).select("post").lean();
  if (!doc?.post) {
    return { ok: false, error: "Comment not found", status: 404 };
  }

  const updated = await PostComment.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { status: nextStatus } },
  );
  if (updated.matchedCount === 0) {
    return { ok: false, error: "Comment not found", status: 404 };
  }

  await syncPostApprovedCommentCount(doc.post as mongoose.Types.ObjectId);
  return { ok: true };
}
