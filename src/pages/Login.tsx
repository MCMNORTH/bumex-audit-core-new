
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      toast({
        title: "Login successful",
        description: "You've been logged in successfully.",
      });
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Incorrect email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md mb-8">
        <img 
          src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/k8h0x3i2mmoy/logo_wide_transparent_black_writing.png"
          alt="OverWork Logo"
          className="mx-auto h-12 mb-6"
        />
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 pb-4 text-center">
          <CardTitle className="text-2xl font-bold text-[#459ed7]">Welcome Back</CardTitle>
          <CardDescription className="text-gray-500">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@example.com" 
                        {...field} 
                        disabled={loading}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage className="text-[#f04f3a]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={loading}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage className="text-[#f04f3a]" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-11 bg-[#459ed7] hover:bg-[#3688bd]" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-gray-500">Don't have an account? </span>
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-[#459ed7] hover:text-[#3688bd]"
                  onClick={() => navigate("/signup")}
                >
                  Sign up
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} OverWork. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
