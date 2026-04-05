import { CommentsModerationClient } from "../comments-moderation-client";

export const dynamic = "force-dynamic";

export const metadata = { title: "Spam queue | Admin" };

export default function CommentsSpamPage() {
  return <CommentsModerationClient initialStatus="spam" />;
}
