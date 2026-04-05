import { connectDB } from "@/helper/db";
import { Category } from "@/models/category";
import { Post } from "@/models/post";
import { PostComment } from "@/models/post-comment";
import { Subcategory } from "@/models/subcategory";

export type BackofficeDashboardStats = {
  publishedPosts: number;
  pendingPosts: number;
  draftPosts: number;
  categories: number;
  subcategories: number;
  pendingComments: number;
  trendingPosts: number;
  failed: boolean;
};

export async function getBackofficeDashboardStats(): Promise<BackofficeDashboardStats> {
  try {
    await connectDB();
    const [
      publishedPosts,
      pendingPosts,
      draftPosts,
      categories,
      subcategories,
      pendingComments,
      trendingPosts,
    ] = await Promise.all([
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "pending" }),
      Post.countDocuments({ status: "draft" }),
      Category.countDocuments({}),
      Subcategory.countDocuments({}),
      PostComment.countDocuments({ status: "pending" }),
      Post.countDocuments({ status: "published", isTrending: true }),
    ]);
    return {
      publishedPosts,
      pendingPosts,
      draftPosts,
      categories,
      subcategories,
      pendingComments,
      trendingPosts,
      failed: false,
    };
  } catch (e) {
    console.error("getBackofficeDashboardStats:", e);
    return {
      publishedPosts: 0,
      pendingPosts: 0,
      draftPosts: 0,
      categories: 0,
      subcategories: 0,
      pendingComments: 0,
      trendingPosts: 0,
      failed: true,
    };
  }
}
