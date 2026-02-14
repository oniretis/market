"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  MessageSquare,
  FolderOpen,
  TrendingUp,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Categories", href: "/admin/categories", icon: FolderOpen },
  { name: "Advertisements", href: "/admin/ads", icon: Image },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { name: "Activity", href: "/admin/activity", icon: Activity },
  { name: "Bulk Operations", href: "/admin/bulk", icon: Settings },
];

export function AdminNav() {
  const [pathname, setPathname] = useState("/");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const routerPathname = usePathname();

  useEffect(() => {
    setPathname(routerPathname || "/");
    // Close sidebar on mobile when navigation occurs
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [routerPathname, sidebarOpen]);

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b lg:border-b-0">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 mt-6 px-3 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t">
            <div className="space-y-1">
              <Link
                href="/"
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Back to Site
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}
