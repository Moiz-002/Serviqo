'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import Link from 'next/link';
import * as api from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.forgotPassword({ phone: `+92${phone}` });
      localStorage.setItem('resetUserId', data.userId);
      if (data.otp) localStorage.setItem('devResetOtp', data.otp);
      router.push('/reset-password');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-md p-9 border border-border space-y-6 animate-fade-up">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-accent transition-colors font-medium mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <div>
            <h2 className="text-2xl font-bold text-text-primary">Reset Password</h2>
            <p className="text-sm text-text-secondary mt-1">
              Enter the phone number linked to your account. We&apos;ll send a verification code through WhatsApp.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                Registered Phone Number
              </label>
              <div className="flex gap-2">
                <span className="flex items-center rounded-lg border border-border bg-neutral-50 px-3 text-sm font-medium text-text-secondary">+92</span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  placeholder="300 1234567"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    if (error) setError('');
                  }}
                  className={`min-w-0 flex-1 rounded-lg border px-4 py-2.5 transition-all ${
                    error
                      ? 'border-error bg-error-light text-error'
                      : 'border-border focus:border-border-focus focus:ring-2 focus:ring-border-focus'
                  } outline-none text-text-primary placeholder-text-tertiary`}
                />
              </div>
              {error && (
                <p className="text-sm text-error mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || phone.length !== 10}
              className="w-full py-2.5 rounded-full bg-primary text-primary-fg font-semibold hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6 shadow-sm hover:shadow-md cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  Send WhatsApp Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthShell>
  );
}
