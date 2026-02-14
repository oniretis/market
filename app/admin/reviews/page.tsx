import { requireAdmin } from "@/app/lib/admin";
import { ReviewModeration } from "@/app/components/admin/ReviewModeration";
import { Suspense } from "react";

export default async function AdminReviewsPage() {
  // Skip auth check during build/static generation
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build") {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Reviews not available during build</p>
        </div>
      </div>
    );
  }

  await requireAdmin();

  return (
    <div className="h-full">
      <Suspense fallback={<div>Loading reviews...</div>}>
        <ReviewModeration />
      </Suspense>
    </div>
  );
}
