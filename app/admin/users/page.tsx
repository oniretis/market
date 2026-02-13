import { requireAdmin } from "@/app/lib/admin";
import { UserManagement } from "@/app/components/admin/UserManagement";
import { Suspense } from "react";

export default async function AdminUsersPage() {
  await requireAdmin();

  return (
    <div className="h-full">
      <Suspense fallback={<div>Loading users...</div>}>
        <UserManagement />
      </Suspense>
    </div>
  );
}
