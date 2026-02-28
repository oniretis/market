"use client";
import { useSidebar } from "./SidebarContext";
import { useEffect, useState } from "react";
import { FloatingToggle } from "./FloatingToggle";

interface AdminMainContentProps {
  children: React.ReactNode;
}

export function AdminMainContent({ children }: AdminMainContentProps) {
  const { isCollapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before applying transitions to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return initial layout without transitions during SSR/hydration
    return (
      <main className="flex-1 lg:ml-64 ml-0">
        <div className="h-full">
          <div className="p-3 lg:p-4">
            {children}
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <FloatingToggle />
      <main
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'lg:ml-2' : 'lg:ml-4'}
          ml-0
          relative
          min-h-screen
        `}
      >
        {/* Add a subtle background pattern for better visual appeal */}
        <div className="absolute inset-0 bg-gray-50">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-50"></div>
        </div>

        {/* Main content container */}
        <div className="relative h-full">
          <div className="p-3 lg:p-4">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
