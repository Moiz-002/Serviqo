'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import Link from 'next/link';
import * as api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.forgotPassword({ identifier: email });
      localStorage.setItem('resetUserId', data.userId);
      if (data.otp) {
        console.log('DEV Password Reset OTP:', data.otp);
        localStorage.setItem('devResetOtp', data.otp);
      }
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-md p-9 border border-border space-y-6 animate-fade-up">
          {!isSubmitted ? (
            <>
              {/* Back to Login */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-accent transition-colors font-medium mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Reset Password</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Enter your registered email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-text-tertiary" />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all ${
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
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-full bg-primary text-primary-fg font-semibold hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6 shadow-sm hover:shadow-md cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-text-primary">Check your email</h2>
                <p className="text-sm text-text-secondary">
                  We've sent a password reset link to <span className="font-semibold text-text-primary">{email}</span>.
                </p>
              </div>
              <p className="text-xs text-text-tertiary">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-text-accent font-semibold hover:underline"
                >
                  try again
                </button>
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-text-accent font-semibold hover:underline transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
