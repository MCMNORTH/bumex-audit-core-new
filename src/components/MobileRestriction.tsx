
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Computer } from "lucide-react";

const MobileRestriction = () => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md flex flex-col items-center mb-8">
        <img 
          src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/k8h0x3i2mmoy/logo_wide_transparent_black_writing.png" 
          alt="Overcode Logo" 
          className="w-full max-w-[280px] mb-6" 
        />
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-0 px-[30px]">
        <CardHeader className="pb-2">
          <div className="text-center">
            <Computer className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-medium">Desktop Access Required</h2>
            <p className="text-sm text-gray-500">Please access this website from a computer</p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              This application is optimized for desktop use and provides the best experience on larger screens.
            </p>
            <p className="text-sm text-gray-600">
              Please visit us from your computer or laptop to access all features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileRestriction;
