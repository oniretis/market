import { requireAdmin } from "@/app/lib/admin";
import { ReviewModeration } from "@/app/components/admin/ReviewModeration";
import { Suspense } from "react";

export default async function AdminReviewsPage() {
  await requireAdmin();

  return (
    <div className="h-full">
      <Suspense fallback={<div>Loading reviews...</div>}>
        <ReviewModeration />
      </Suspense>
    </div>
  );
}
