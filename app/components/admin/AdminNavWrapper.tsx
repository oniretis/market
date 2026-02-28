"use client";
import { AdminNav } from "./AdminNav";
import { SidebarProvider, useSidebar } from "./SidebarContext";

function AdminNavWithProvider() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return <AdminNav isCollapsed={isCollapsed} onToggle={toggleSidebar} />;
}

export { AdminNavWithProvider };
export function AdminNavWrapper() {
  return <AdminNavWithProvider />;
}
