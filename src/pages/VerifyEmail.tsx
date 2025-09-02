import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services/supabaseService";
import { Mail, Shield, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email') || '';
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      setIsVerifying(false);
      return;
    }

    try {
      await authService.verifyOTP(email, verificationCode, 'email');
      toast.success('Email verified successfully!');
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Invalid verification code. Please try again.');
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      await authService.resendOTP(email);
      toast.success('New verification code sent!');
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      setError(error.message || 'Failed to resend code. Please try again.');
      toast.error('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToAuth = () => {
    navigate('/auth');
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="neomorph-raised border-0 shadow-none w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Invalid verification link</p>
            <Button onClick={handleBackToAuth} className="neomorph-button border-0">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 neomorph-raised rounded-2xl flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Verify Your Email
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            We sent a verification code to<br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        {/* Verification Options */}
        <Card className="neomorph-raised border-0 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Two Ways to Verify
            </CardTitle>
            <CardDescription>
              Choose your preferred verification method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Option 1: Click Email Link */}
            <div className="neomorph-inset p-4 rounded-lg space-y-2">
              <h3 className="font-medium text-sm">Option 1: Click Email Link</h3>
              <p className="text-xs text-muted-foreground">
                Check your email and click the confirmation link we sent you.
              </p>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              — OR —
            </div>

            {/* Option 2: Enter Code */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Option 2: Enter Verification Code</h3>
              
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <Label htmlFor="verification-code" className="text-sm font-medium mb-2 block">
                    6-Digit Code
                  </Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerificationCode(value);
                    }}
                    className="neomorph-inset border-0 focus:ring-2 focus:ring-primary focus:ring-offset-0 text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                {error && (
                  <Alert className="neomorph-inset border-0">
                    <AlertDescription className="text-destructive text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full neomorph-button border-0 gradient-primary text-primary-foreground"
                  disabled={isVerifying || verificationCode.length !== 6}
                >
                  {isVerifying ? "Verifying..." : "Verify Email"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="neomorph-raised border-0 shadow-none">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleResendCode}
                variant="outline"
                className="w-full neomorph-button border-0"
                disabled={isResending || countdown > 0}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
                {countdown > 0 
                  ? `Resend Code (${countdown}s)`
                  : isResending 
                    ? 'Sending...' 
                    : 'Resend Code'
                }
              </Button>
              
              <Button
                onClick={handleBackToAuth}
                variant="ghost"
                className="w-full neomorph-button border-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground neomorph-inset p-3 rounded-lg inline-block">
            💡 <strong>Tip:</strong> Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
}
