import { CommentsModerationClient } from "./comments-moderation-client";

export const dynamic = "force-dynamic";

export const metadata = { title: "Comments | Admin" };

export default function CommentsPage() {
  return <CommentsModerationClient initialStatus="pending" />;
}
