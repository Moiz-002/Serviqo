'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { OtpInput } from '@/components/auth/OtpInput';

const ADMIN_CREDENTIALS = {
  email: 'admin@serviqo.com',
  password: 'Serviqo@1234',
};

const ADMIN_OTP = '123456';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState(false);

  const validateCredentials = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleCredentialsSubmit = async (event) => {
    event.preventDefault();
    const validation = validateCredentials();

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    if (
      email.trim().toLowerCase() !== ADMIN_CREDENTIALS.email ||
      password !== ADMIN_CREDENTIALS.password
    ) {
      setErrors({ general: 'Invalid admin email or password' });
      return;
    }

    setErrors({});
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);
    setStep('totp');
  };

  const handleOtpComplete = (value) => {
    if (value === ADMIN_OTP) {
      router.push('/admin/dashboard');
      return;
    }

    setOtpError(true);
  };

  return (
    <AuthShell>
      <div className="w-full max-w-md px-4">
        <div className="bg-surface rounded-[32px] shadow-lg border border-border p-8 sm:p-10 animate-fade-up">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-subtle border border-primary-light rounded-full">
              <span className="text-xs font-semibold text-text-brand uppercase tracking-wide">
                ADMIN PANEL
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-text-primary">
              Sign in to Serviqo Admin
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Secure access for admins only. Use your admin credentials and TOTP code.
            </p>
          </div>

          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              {errors.general && (
                <div className="rounded-2xl bg-error-light p-3 text-sm text-error">
                  {errors.general}
                </div>
              )}

              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-text-primary mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-text-tertiary" />
                  <input
                    id="admin-email"
                    name="admin-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    placeholder="admin@serviqo.com"
                    className={`w-full rounded-2xl border px-10 py-3 text-text-primary transition-all outline-none ${
                      errors.email
                        ? 'border-error bg-error-light'
                        : 'border-border focus:border-border-focus focus:ring-2 focus:ring-border-focus'
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-error">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="admin-password" className="text-sm font-medium text-text-primary">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-text-tertiary" />
                  <input
                    id="admin-password"
                    name="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                    placeholder="Enter your password"
                    className={`w-full rounded-2xl border px-10 py-3 text-text-primary transition-all outline-none ${
                      errors.password
                        ? 'border-error bg-error-light'
                        : 'border-border focus:border-border-focus focus:ring-2 focus:ring-border-focus'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-3 text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-error">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Validating…' : 'Continue to verification'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-primary-subtle p-5">
                <p className="text-sm font-semibold text-text-primary">
                  Enter your 6-digit authentication code
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Use your authenticator app or admin TOTP device.
                </p>
              </div>

              <div className="space-y-4">
                <OtpInput length={6} onComplete={handleOtpComplete} isError={otpError} />
                {otpError && (
                  <p className="text-center text-sm text-error">
                    Invalid code. Please try again.
                  </p>
                )}
                <p className="text-xs text-text-tertiary text-center">
                  For demo only: use <strong>123456</strong>
                </p>

                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-text-primary transition hover:bg-neutral-100"
                >
                  Back to credentials
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
}