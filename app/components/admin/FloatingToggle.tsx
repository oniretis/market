"use client";
import { useSidebar } from "./SidebarContext";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingToggle() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  if (!isCollapsed) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-40 lg:block hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSidebar}
        className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200"
        title="Expand Sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>
    </div>
  );
}
