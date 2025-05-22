
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  footer 
}) => {
  return (
    <Card className="w-full max-w-md shadow-lg border-0">
      <CardHeader className="pb-2">
        <div className="text-center">
          <h2 className="text-xl font-medium">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {children}
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        {footer}
      </CardFooter>
    </Card>
  );
};
