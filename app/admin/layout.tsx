import { requireAdmin } from "@/app/lib/admin";
import { AdminNavWrapper } from "@/app/components/admin/AdminNavWrapper";
import { ToastProvider } from "../components/ui/simple-toast";
import ErrorBoundary from "../components/ui/error-boundary";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Skip auth check during build/static generation
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build") {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="w-64 bg-white shadow-lg">
          <div className="h-16 px-6 border-b flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel (Build)</h1>
          </div>
        </div>
        <main className="flex-1 lg:pl-0">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Admin pages are not available during build</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
