
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileHeader = () => {
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const handleToggle = () => {
    setOpenMobile(true);
  };

  return (
    <div className="md:hidden bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          onClick={handleToggle}
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <img 
          src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/2dgtj37xrkp6/Logo_wide_transparent.png" 
          alt="OVERCODE" 
          className="h-6" 
        />
        
        <div className="w-10" /> {/* Spacer to center the logo */}
      </div>
    </div>
  );
};
