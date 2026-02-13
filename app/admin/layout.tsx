import { requireAdmin } from "@/app/lib/admin";
import { AdminNavWrapper } from "@/app/components/admin/AdminNavWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavWrapper />
      <main className="flex-1 lg:pl-0">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
