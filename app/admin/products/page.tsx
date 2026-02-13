import { requireAdmin } from "@/app/lib/admin";
import { ProductApprovalList } from "@/app/components/admin/ProductApprovalList";
import { Suspense } from "react";

export default async function AdminProductsPage() {
  await requireAdmin();

  return (
    <div className="h-full">
      <Suspense fallback={<div>Loading products...</div>}>
        <ProductApprovalList />
      </Suspense>
    </div>
  );
}
