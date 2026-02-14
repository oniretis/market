import { requireAdmin } from "@/app/lib/admin";
import AdvertisementManagement from "../../components/admin/AdvertisementManagement";
import { Suspense } from "react";

export default async function AdsPage() {
  // Skip auth check during build/static generation
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build") {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Advertisements not available during build</p>
        </div>
      </div>
    );
  }

  await requireAdmin();

  return (
    <div className="h-full">
      <Suspense fallback={<div>Loading advertisements...</div>}>
        <AdvertisementManagement />
      </Suspense>
    </div>
  );
}
