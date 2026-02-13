import { requireAdmin } from "@/app/lib/admin";
import { ActivityMonitoring } from "@/app/components/admin/ActivityMonitoring";
import { Suspense } from "react";

export default async function AdminActivityPage() {
  await requireAdmin();

  return (
    <div className="h-full">
      <Suspense fallback={<div>Loading activity...</div>}>
        <ActivityMonitoring />
      </Suspense>
    </div>
  );
}
