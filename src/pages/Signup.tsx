import { Link } from "react-router-dom";
import { FormHeader } from "@/components/auth/FormHeader";
import { SignupForm } from "@/components/auth/SignupForm";
import { AuthCard } from "@/components/auth/AuthCard";
const Signup = () => {
  const footerContent = <p className="text-sm text-gray-500">
      Already have an account?{" "}
      <Link to="/login" className="text-primary hover:underline font-medium">
        Log in
      </Link>
    </p>;
  return <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <FormHeader title="Create account" subtitle="Project management made simple" />
      
      <AuthCard title="Create an account" subtitle="Fill in your details to get started" footer={footerContent}>
        <SignupForm />
      </AuthCard>
    </div>;
};
export default Signup;