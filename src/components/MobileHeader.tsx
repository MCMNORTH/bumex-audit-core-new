
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileDrawer } from "./MobileDrawer";

const MobileHeader = () => {
  return (
    <header className="bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between md:hidden">
      <img 
        src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/2dgtj37xrkp6/Logo_wide_transparent.png" 
        alt="OVERCODE" 
        className="h-7" 
      />
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <MobileDrawer />
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileHeader;
