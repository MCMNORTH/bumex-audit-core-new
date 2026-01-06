import { useState, useEffect, useCallback, useRef } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, RefreshCw, Timer } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  isVerifying: boolean;
  isResending: boolean;
  error?: string;
}

const OTPVerification = ({
  email,
  onVerify,
  onResend,
  onBack,
  isVerifying,
  isResending,
  error
}: OTPVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [expiryCountdown, setExpiryCountdown] = useState(300); // 5 minutes in seconds
  const lastAutoSubmitRef = useRef<string | null>(null);

  // Countdown for resend button
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Countdown for OTP expiry
  useEffect(() => {
    if (expiryCountdown > 0) {
      const timer = setTimeout(() => setExpiryCountdown(expiryCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [expiryCountdown]);

  // Reset auto-submit guard if user edits the code
  useEffect(() => {
    if (otp.length < 6) {
      lastAutoSubmitRef.current = null;
    }
  }, [otp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = useCallback(async () => {
    await onResend();
    setCountdown(60);
    setCanResend(false);
    setExpiryCountdown(300);
    setOtp('');
    lastAutoSubmitRef.current = null;
  }, [onResend]);

  const handleVerify = useCallback(async () => {
    if (otp.length === 6 && !isVerifying) {
      // Prevent infinite re-submits on the same 6-digit value
      lastAutoSubmitRef.current = otp;
      await onVerify(otp);
    }
  }, [otp, onVerify, isVerifying]);

  // Auto-submit when 6 digits are entered (once per code)
  useEffect(() => {
    if (
      otp.length === 6 &&
      !isVerifying &&
      lastAutoSubmitRef.current !== otp
    ) {
      handleVerify();
    }
  }, [otp, isVerifying, handleVerify]);

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

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
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to<br />
              <span className="font-medium text-gray-700">{maskedEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <div className="text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Timer className="w-4 h-4" />
              <span>
                Code expires in <span className={expiryCountdown < 60 ? 'text-red-600 font-medium' : ''}>
                  {formatTime(expiryCountdown)}
                </span>
              </span>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={!canResend || isResending}
                className="text-sm"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : canResend ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                ) : (
                  `Resend code in ${countdown}s`
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={onBack}
              className="w-full"
              disabled={isVerifying}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTPVerification;
