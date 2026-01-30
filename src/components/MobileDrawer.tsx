import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ClipboardList, Star, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "@/store";
import { useAuth } from "@/contexts/AuthContext";
import { LogoutButton } from "./LogoutButton";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export const MobileDrawer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const isRouteActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <img 
          src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/2dgtj37xrkp6/Logo_wide_transparent.png" 
          alt="OVERCODE" 
          className="h-7" 
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <Button 
            onClick={() => navigate('/')} 
            className={cn(
              "w-full justify-start gap-2",
              isRouteActive('/') 
                ? "bg-jira-blue hover:bg-jira-blue-dark" 
                : "bg-transparent hover:bg-sidebar-accent text-sidebar-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            {t('dashboard')}
          </Button>

          <Button 
            onClick={() => navigate('/my-invoices')} 
            className={cn(
              "w-full justify-start gap-2",
              isRouteActive('/my-invoices') 
                ? "bg-jira-blue hover:bg-jira-blue-dark" 
                : "bg-transparent hover:bg-sidebar-accent text-sidebar-foreground"
            )}
          >
            <ClipboardList className="h-4 w-4" />
            {t('myInvoices')}
          </Button>
        </div>

      </div>

      {/* Language Selector */}
      <LanguageSelector variant="mobile" />

      <div className="mt-auto border-t border-sidebar-border p-4 space-y-2">
        <Button 
          onClick={() => navigate('/profile')} 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground",
            isRouteActive('/profile') ? "bg-sidebar-accent text-sidebar-foreground" : ""
          )}
        >
          <User className="mr-2 h-4 w-4" />
          {t('profile')}
        </Button>
        <LogoutButton />
      </div>
    </div>
  );
};
