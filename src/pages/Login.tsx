import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { firestore } from "@/lib/firebase";
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters."
  })
});
type LoginFormData = z.infer<typeof loginSchema>;
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    login,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // First authenticate the user with Firebase
      const userCredential = await login(data.email, data.password);

      // Then check if the user is an admin
      if (userCredential.user) {
        const userData = await firestore.getUser(userCredential.user.uid);
        if (userData && userData.admin === true) {
          toast("Login successful", {
            description: "Welcome back!"
          });
          navigate("/");
        } else {
          // If not admin, sign them out using the logout function from AuthContext
          await logout();
          setAuthError("Access denied. Only administrators can access this application.");
          toast("Access denied", {
            description: "Only administrators can access this application."
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Invalid email or password. Please try again.");
      toast("Login failed", {
        description: "Invalid email or password. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="max-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center mb-8">
        <img src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/k8h0x3i2mmoy/logo_wide_transparent_black_writing.png" alt="Jira Management Logo" className="w-full max-w-[280px] mb-6" />
        <p className="text-gray-500 text-sm mb-2">Project management made simple</p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-0 px-[30px]">
        <CardHeader className="pb-2">
          <div className="text-center">
            <h2 className="text-xl font-medium">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your account</p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {authError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {authError}
                </div>}
              <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="you@example.com" className="pl-10 px-[80px]" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="password" render={({
              field
            }) => <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>;
};
export default Login;