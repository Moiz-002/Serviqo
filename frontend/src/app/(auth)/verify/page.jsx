'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ChevronLeft,
  RotateCcw,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { OtpInput } from '@/components/auth/OtpInput';

export default function VerifyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(59);
  const [showResend, setShowResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setShowResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpComplete = async (otp) => {
    setIsLoading(true);
    setIsError(false);

    // Simulate API verification
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock validation: accept any 6 digits (in production, verify with backend)
    if (otp.length === 6) {
      setIsLoading(false);
      router.push('/dashboard');
    } else {
      setIsError(true);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setTimeLeft(59);
    setShowResend(false);
    // In production: call resend OTP API
  };

  const maskPhone = '+92 3** ****789';

  return (
    <AuthShell>
      <div className="w-full flex items-center justify-center flex-col max-w-sm">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="flex gap-2 text-text-secondary hover:text-text-primary mb-6 text-sm font-medium transition-colors w-full items-start justify-start cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Signup
        </button>

        {/* Main Card */}
        <div className="bg-surface rounded-2xl shadow-md p-10 border border-border space-y-6 animate-fade-up">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary-subtle flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-text-primary">Security Verification</h2>
            <p className="text-sm text-text-secondary">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-sm font-semibold text-text-brand">{maskPhone}</p>
          </div>

          {/* Error Message */}
          {isError && (
            <div className="p-4 bg-error-light border border-error rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
              <p className="text-sm text-error">Invalid code. Please try again.</p>
            </div>
          )}

          {/* OTP Input */}
          <OtpInput length={6} onComplete={handleOtpComplete} isError={isError} />

          {/* Verify Button */}
          <button
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-primary text-primary-fg font-semibold hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Continue'
            )}
          </button>

          {/* Timer or Resend Options */}
          <div className="space-y-4 text-center">
            {!showResend ? (
              <p className="text-sm text-text-secondary flex items-center justify-center gap-1">
                <RotateCcw className="w-4 h-4" />
                Resend code in {String(timeLeft).padStart(2, '0')}s
              </p>
            ) : (
              <div className="flex gap-4 justify-center text-sm">
                <button
                  onClick={handleResend}
                  className="flex items-center gap-1.5 text-text-accent hover:text-accent font-semibold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resend via SMS
                </button>
                <span className="text-border">|</span>
                <button className="flex items-center gap-1.5 text-text-accent hover:text-accent font-semibold transition-colors">
                  <Phone className="w-4 h-4" />
                  Call me instead
                </button>
              </div>
            )}
          </div>

          {/* Support Link */}
          <div className="border-t border-border pt-4 text-center">
            <p className="text-xs text-text-secondary">
              Didn't receive a code? Check your spam folder or contact our{' '}
              <a href="#" className="text-text-accent font-semibold hover:underline">
                Support Team
              </a>
            </p>
          </div>
        </div>

        {/* Below Card */}
        <p className="text-center mt-6 text-sm text-text-secondary">
          Incorrect phone number?{' '}
          <button className="text-text-accent font-semibold hover:underline">Change number</button>
        </p>
      </div>
    </AuthShell>
  );
}
