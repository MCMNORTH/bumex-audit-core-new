
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignupForm } from "@/components/auth/SignupForm";
import { Card, CardContent } from "@/components/ui/card";

const Signup = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 mt-2">Get started with project management made simple</p>
        </div>
        
        <Card className="shadow-lg border-0">
          <CardContent className="pt-6">
            <SignupForm />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
