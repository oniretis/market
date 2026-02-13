import { requireAdmin } from "@/app/lib/admin";
import { BulkOperations } from "@/app/components/admin/BulkOperations";
import { Suspense } from "react";

export default async function AdminBulkPage() {
  await requireAdmin();

  return (
    <div className="h-full">
      <Suspense fallback={<div>Loading bulk operations...</div>}>
        <BulkOperations />
      </Suspense>
    </div>
  );
}
