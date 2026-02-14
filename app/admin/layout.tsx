import { requireAdmin } from "@/app/lib/admin";
import { AdminNavWrapper } from "@/app/components/admin/AdminNavWrapper";
import { ToastProvider } from "../components/ui/simple-toast";
import ErrorBoundary from "../components/ui/error-boundary";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /unauthorized if user is not admin
  await requireAdmin();

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex">
          <AdminNavWrapper />
          <main className="flex-1 lg:pl-0">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
}
