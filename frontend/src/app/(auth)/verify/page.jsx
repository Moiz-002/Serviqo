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
import * as api from '@/lib/api';

export default function VerifyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(59);
  const [showResend, setShowResend] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('+92 3** ****789');

  useEffect(() => {
    const phone = localStorage.getItem('pendingPhone');
    if (phone) {
      const masked = phone.slice(0, 4) + '****' + phone.slice(-3);
      setMaskedPhone(masked);
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setShowResend(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpComplete = async (otp) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMsg('');

    const userId = localStorage.getItem('pendingUserId');
    if (!userId) {
      setIsError(true);
      setErrorMsg('Session expired. Please sign up again.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.verifyOtp({ userId, otp });
      localStorage.removeItem('pendingUserId');
      localStorage.removeItem('pendingPhone');
      localStorage.removeItem('devOtp');

      const role = data.user?.role;
      if (role === 'worker') {
        try {
          const cnicRaw = sessionStorage.getItem('pendingCnic');
          if (cnicRaw) {
            sessionStorage.removeItem('pendingCnic');
            const cnicData = JSON.parse(cnicRaw);
            const fd = new FormData();
            if (cnicData.front) {
              const blob = await fetch(cnicData.front).then((r) => r.blob());
              fd.append('cnicFront', blob, 'cnic-front.jpg');
            }
            if (cnicData.back) {
              const blob = await fetch(cnicData.back).then((r) => r.blob());
              fd.append('cnicBack', blob, 'cnic-back.jpg');
            }
            if (fd.has('cnicFront') || fd.has('cnicBack')) {
              await api.uploadCnic(fd);
            }
          }
        } catch {}
        router.push('/onboarding');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err) {
      setIsError(true);
      setErrorMsg(err.message || 'Invalid code. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setTimeLeft(59);
    setShowResend(false);
    const userId = localStorage.getItem('pendingUserId');
    if (!userId) return;
    try {
      const data = await api.resendOtp({ userId });
      if (data.otp) {
        console.log('DEV OTP:', data.otp);
        localStorage.setItem('devOtp', data.otp);
      }
    } catch (err) {
      console.error('Resend OTP error:', err.message);
    }
  };

  return (
    <AuthShell>
      <div className="w-full flex items-center justify-center flex-col max-w-sm">
        <button
          onClick={() => router.back()}
          className="flex gap-2 text-text-secondary hover:text-text-primary mb-6 text-sm font-medium transition-colors w-full items-start justify-start cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Signup
        </button>

        <div className="bg-surface rounded-2xl shadow-md p-10 border border-border space-y-6 animate-fade-up">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary-subtle flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-text-primary">Security Verification</h2>
            <p className="text-sm text-text-secondary">We've sent a 6-digit verification code to</p>
            <p className="text-sm font-semibold text-text-brand">{maskedPhone}</p>
          </div>

          {isError && (
            <div className="p-4 bg-error-light border border-error rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
              <p className="text-sm text-error">{errorMsg || 'Invalid code. Please try again.'}</p>
            </div>
          )}

          <OtpInput length={6} onComplete={handleOtpComplete} isError={isError} />

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
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 text-center">
            <p className="text-xs text-text-secondary">
              Didn't receive a code? Check your spam folder or contact our{' '}
              <a href="#" className="text-text-accent font-semibold hover:underline">Support Team</a>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-text-secondary">
          Incorrect phone number?{' '}
          <button onClick={() => router.push('/signup')} className="text-text-accent font-semibold hover:underline">
            Change number
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
