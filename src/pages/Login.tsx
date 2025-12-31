import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { isCountryAllowed, getGeolocationData } from '@/lib/geolocation';
import { GeoRestricted } from '@/components/GeoRestricted';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';

const REMEMBERED_EMAIL_KEY = 'bumex_remembered_email';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(true);
  const [isGeoAllowed, setIsGeoAllowed] = useState(true);
  const [clientInfo, setClientInfo] = useState<{ country: string; country_code: string } | null>(null);
  const {
    login,
    user,
    authError,
    loading: authLoading
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Check geolocation on component mount
  useEffect(() => {
    const checkGeolocation = async () => {
      try {
        const allowed = await isCountryAllowed();
        setIsGeoAllowed(allowed);
        
        if (!allowed) {
          const info = await getGeolocationData();
          setClientInfo({
            country: info.country,
            country_code: info.country_code
          });
        }
      } catch (error) {
        // Silent error for geolocation check
        // Fail-open: allow access on error
        setIsGeoAllowed(true);
      } finally {
        setGeoLoading(false);
      }
    };

    checkGeolocation();
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
    try {
      // Save or clear remembered email based on checkbox
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      await login(email, password);
      toast({
        title: 'Success',
        description: 'Logged in successfully'
      });
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

  // Show loading if auth is still initializing or checking geolocation
  if (authLoading || geoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show geo restriction if not allowed
  if (!isGeoAllowed) {
    return <GeoRestricted country={clientInfo?.country} countryCode={clientInfo?.country_code} />;
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
                  className="mt-1" 
                  placeholder="Enter your email" 
                />
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;