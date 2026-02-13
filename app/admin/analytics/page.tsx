import { requireAdmin } from "@/app/lib/admin";
import { RevenueAnalytics } from "@/app/components/admin/RevenueAnalytics";
import { Suspense } from "react";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  return (
    <div className="h-full">
      <Suspense fallback={<div>Loading analytics...</div>}>
        <RevenueAnalytics />
      </Suspense>
    </div>
  );
}
