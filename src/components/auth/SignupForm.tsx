
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Mail, Lock, User, Phone, Building } from "lucide-react";

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  contactNumber: z.string().min(5, { message: "Please enter a valid contact number." }),
  company: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      contactNumber: "",
      company: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // Create the user with Firebase Auth
      const userCredential = await signup(data.email, data.password);
      
      // Save additional user data to Firestore
      if (userCredential && userCredential.user) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          id: userCredential.user.uid,
          name: data.fullName,
          email: data.email,
          contactNumber: data.contactNumber,
          company: data.company || null,
          userType: "client", // Default to client
          createdAt: new Date().toISOString(),
          admin: false,  // Set admin flag to false by default
          client: true   // Set client flag to true by default
        });
      }
      
      // Show success toast
      toast("Account created successfully", {
        description: "You can now log in with your credentials",
        duration: 5000
      });
      
      // Redirect to login page instead of home
      navigate("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast("Signup failed", {
        description: error.message || "Something went wrong. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PersonalInfoFields control={form.control} />
        <CompanyField control={form.control} />
        <EmailField control={form.control} />
        <PasswordFields control={form.control} />
        
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
};

// Form field components
const PersonalInfoFields = ({ control }: { control: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormField
      control={control}
      name="fullName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Full Name</FormLabel>
          <FormControl>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="John Doe" className="pl-10" {...field} />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    
    <FormField
      control={control}
      name="contactNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Contact Number</FormLabel>
          <FormControl>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="+1 (555) 123-4567" className="pl-10" {...field} />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

const CompanyField = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name="company"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Company (Optional)</FormLabel>
        <FormControl>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input placeholder="Company Name" className="pl-10" {...field} />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const EmailField = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input placeholder="you@example.com" className="pl-10" {...field} />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const PasswordFields = ({ control }: { control: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormField
      control={control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    
    <FormField
      control={control}
      name="confirmPassword"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Confirm Password</FormLabel>
          <FormControl>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);
