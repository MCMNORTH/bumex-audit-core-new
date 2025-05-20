
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
};
