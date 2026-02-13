import { requireAdmin } from "@/app/lib/admin";
import { AdminDashboard } from "@/app/components/admin/AdminDashboard";
import { Suspense } from "react";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="h-full">
      <Suspense fallback={<div>Loading...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
