import { requireAdmin } from "@/app/lib/admin";
import { CategoryTagManagement } from "@/app/components/admin/CategoryTagManagement";
import { Suspense } from "react";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  return (
    <div className="h-full">
      <Suspense fallback={<div>Loading categories...</div>}>
        <CategoryTagManagement />
      </Suspense>
    </div>
  );
}
