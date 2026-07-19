"use client";

import * as React from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";

export const AdminLayoutContext = React.createContext<{
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
});

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <AdminLayoutContext.Provider
      value={{ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }}
    >
      <div className="flex min-h-screen bg-gray-50/80">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminNavbar />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminLayoutContext.Provider>
  );
}
