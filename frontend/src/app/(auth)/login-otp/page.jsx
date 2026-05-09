'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';
import {
  Phone,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { OtpInput } from '@/components/auth/OtpInput';
import Button from '@/components/ui/Button';

export default function LoginOtpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [timeLeft, setTimeLeft] = useState(59);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    if (step === 2) {
      if (timeLeft <= 0) {
        setShowResend(true);
        return;
      }
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setErrors({ phone: 'Please enter a valid 10-digit phone number' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const fullPhone = '+92' + phone.replace(/\D/g, '');
      const data = await api.requestLoginOtp({ phone: fullPhone, role });
      setUserId(data.userId);
      if (data.otp) {
        console.log('DEV LOGIN OTP:', data.otp);
        localStorage.setItem('devOtp', data.otp);
      }
      setStep(2);
      setTimeLeft(59);
      setShowResend(false);
    } catch (err) {
      setErrors({ phone: err.message || 'Phone number not registered' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    setIsLoading(true);
    setErrors({});

    try {
      const data = await api.verifyLoginOtp({ userId, otp });
      localStorage.removeItem('devOtp');
      
      const role = data.user?.role;
      if (role === 'worker') {
        router.push('/worker/dashboard');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err) {
      setErrors({ otp: err.message || 'Invalid code.' });
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const fullPhone = '+92' + phone.replace(/\D/g, '');
      const data = await api.requestLoginOtp({ phone: fullPhone, role });
      if (data.otp) {
        console.log('DEV LOGIN OTP:', data.otp);
        localStorage.setItem('devOtp', data.otp);
      }
      setTimeLeft(59);
      setShowResend(false);
    } catch (err) {
      setErrors({ otp: 'Failed to resend OTP' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-md p-9 border border-border space-y-6 animate-fade-up">
          {/* Portal Selector */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-subtle border border-primary-light rounded-full">
              <span className="text-xs font-semibold text-text-brand uppercase tracking-wide">
                {role === 'customer' ? 'CUSTOMER PORTAL' : 'WORKER PORTAL'}
              </span>
            </div>
            {step === 1 && (
              <button
                onClick={() => setRole(role === 'customer' ? 'worker' : 'customer')}
                className="text-sm text-text-secondary border-2 border-text-accent px-2 py-1 cursor-pointer hover:text-text-accent font-medium transition-colors"
              >
                Switch to {role === 'customer' ? 'Worker' : 'Customer'}
              </button>
            )}
          </div>

          {step === 1 ? (
            <>
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Login with OTP</h2>
                <p className="text-sm text-text-secondary mt-1">Enter your phone number to receive a secure code</p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="px-3 py-2.5 border border-border rounded-lg bg-neutral-50 text-text-secondary font-medium flex items-center">
                      +92
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                      <input
                        id="phone"
                        type="text"
                        placeholder="300 1234567"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                          setErrors({});
                        }}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all ${
                          errors.phone
                            ? 'border-error bg-error-light text-error'
                            : 'border-border focus:border-border-focus focus:ring-2 focus:ring-border-focus'
                        } outline-none text-text-primary placeholder-text-tertiary`}
                      />
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-error mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-4"
                  isLoading={isLoading}
                  disabled={isLoading || !phone}
                >
                  Send OTP
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary-subtle flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-text-primary">Verify Login</h2>
                <p className="text-sm text-text-secondary">Code sent to +92 {phone.slice(0, 3)} ****{phone.slice(-3)}</p>
              </div>

              {errors.otp && (
                <div className="p-4 bg-error-light border border-error rounded-lg flex items-center gap-3 text-left">
                  <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                  <p className="text-sm text-error">{errors.otp}</p>
                </div>
              )}

              <OtpInput length={6} onComplete={handleVerifyOtp} isError={!!errors.otp} />

              <div className="space-y-4 pt-2">
                {!showResend ? (
                  <p className="text-sm text-text-secondary flex items-center justify-center gap-1">
                    <RotateCcw className="w-4 h-4" />
                    Resend code in {String(timeLeft).padStart(2, '0')}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="flex items-center justify-center gap-1.5 text-text-accent hover:text-accent font-semibold transition-colors w-full"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Resend Verification Code
                  </button>
                )}
              </div>

              <button
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Phone Number
              </button>
            </div>
          )}

          {/* Back to Password Login */}
          <div className="border-t border-border pt-4 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm font-semibold text-text-brand hover:underline"
            >
              Login with Password
            </button>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
