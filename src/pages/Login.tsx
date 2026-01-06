import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import OTPVerification from '@/components/OTPVerification';
import { isValidCompanyEmail, ALLOWED_EMAIL_DOMAIN } from '@/utils/domainValidation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const REMEMBERED_EMAIL_KEY = 'bumex_remembered_email';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState<string | undefined>();
  
  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  const {
    login,
    verifyCredentials,
    sendOTP,
    verifyOTPAndLogin,
    sendPasswordResetEmail,
    pendingAuth,
    user,
    authError,
    loading: authLoading
  } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Email domain validation - only show error if email has @ and is not valid bumex email
  const showDomainError = useMemo(() => {
    if (!email || !email.includes('@')) return false;
    return !isValidCompanyEmail(email);
  }, [email]);
  const isValidEmail = useMemo(() => isValidCompanyEmail(email), [email]);
  
  // Reset email validation
  const resetEmailValid = useMemo(() => isValidCompanyEmail(resetEmail), [resetEmail]);
  const showResetDomainError = useMemo(() => {
    if (!resetEmail || !resetEmail.includes('@')) return false;
    return !isValidCompanyEmail(resetEmail);
  }, [resetEmail]);

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOtpError(undefined);
    
    try {
      // Save or clear remembered email based on checkbox
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      // Verify credentials and send OTP
      await verifyCredentials(email, password);
      
      toast({
        title: 'Verification Code Sent',
        description: 'Please check your email for the verification code'
      });
      
      setOtpStep(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to login',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setIsVerifying(true);
    setOtpError(undefined);
    
    try {
      await verifyOTPAndLogin(otp);
      
      toast({
        title: 'Success',
        description: 'Logged in successfully'
      });
    } catch (error: any) {
      setOtpError(error.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingAuth) return;
    
    setIsResending(true);
    setOtpError(undefined);
    
    try {
      await sendOTP();
      
      toast({
        title: 'Code Sent',
        description: 'A new verification code has been sent to your email'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend code',
        variant: 'destructive'
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    setOtpStep(false);
    setOtpError(undefined);
    setPassword('');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmailValid) {
      toast({
        title: 'Invalid Email',
        description: `Password reset is only available for ${ALLOWED_EMAIL_DOMAIN} emails.`,
        variant: 'destructive'
      });
      return;
    }
    
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(resetEmail);
      toast({
        title: 'Reset Email Sent',
        description: 'Please check your email for password reset instructions.'
      });
      setForgotPasswordOpen(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email',
        variant: 'destructive'
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Show auth error if user authentication failed due to approval/blocking
  useEffect(() => {
    if (authError) {
      toast({
        title: 'Authentication Error',
        description: authError,
        variant: 'destructive'
      });
    }
  }, [authError, toast]);

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show OTP verification screen
  if (otpStep && pendingAuth) {
    return (
      <OTPVerification
        email={email}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        onBack={handleBackToLogin}
        isVerifying={isVerifying}
        isResending={isResending}
        error={otpError}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/bumex-2713a.firebasestorage.app/o/auditcore%20(1).png?alt=media&token=1b78a202-db03-4072-a347-ee63d8f40c23" 
              alt="BUMEX Logo" 
              className="w-32 h-8 object-contain" 
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Management System</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your email and password to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className={`mt-1 ${showDomainError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder={`name${ALLOWED_EMAIL_DOMAIN}`}
                />
                {showDomainError && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-destructive text-sm">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Access restricted to BUMEX employees only. Please use your {ALLOWED_EMAIL_DOMAIN} email.</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    placeholder="Enter your password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember-me" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label 
                  htmlFor="remember-me" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={loading || (email.includes('@') && !isValidEmail)}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
            
            {/* Forgot Password Dialog */}
            <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your {ALLOWED_EMAIL_DOMAIN} email address and we'll send you a link to reset your password.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      required
                      className={`mt-1 ${showResetDomainError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      placeholder={`name${ALLOWED_EMAIL_DOMAIN}`}
                    />
                    {showResetDomainError && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-destructive text-sm">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Access restricted to BUMEX employees only. Please use your {ALLOWED_EMAIL_DOMAIN} email.</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={resetLoading || (resetEmail.includes('@') && !resetEmailValid)}
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
