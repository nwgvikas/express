import { CategoriesClient } from "./categories-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Category | Admin",
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}
