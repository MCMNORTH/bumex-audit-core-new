
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";

export const Layout = () => {
  useEffect(() => {
    document.title = "Dashboard Overcode";
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex-1 overflow-auto flex flex-col">
          <MobileHeader />
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};
