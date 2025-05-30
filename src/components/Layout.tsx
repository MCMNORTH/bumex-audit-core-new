
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Layout = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    document.title = "Dashboard Overcode";
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {!isMobile && <Sidebar />}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};
