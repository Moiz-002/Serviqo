'use client';

import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { OtpInput } from '@/components/auth/OtpInput';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleAccessCodeComplete = (code) => {
    setAccessCode(code);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !accessCode) {
      setError('Please fill in all fields');
      triggerShake();
      return;
    }

    if (!email.includes('@')) {
      setError('Invalid email address');
      triggerShake();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const isValidCredentials = email === 'admin@serviqo.com' && password === 'admin123';
      const isValidCode = accessCode === '000000' || accessCode === '123456';

      if (isValidCredentials && isValidCode) {
        document.cookie = 'serviqo_session=admin:admin1; path=/; max-age=86400';
        router.push('/admin/dashboard');
      } else {
        setError('Invalid credentials or access code. This attempt has been logged.');
        setAccessCode('');
        triggerShake();
      }

      setIsLoading(false);
    }, 2000);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <AuthShell>
      <div className={`w-full max-w-md ${shake ? 'animate-shake' : ''}`}>
        <div className="bg-surface rounded-2xl shadow-md p-9 border border-border space-y-6 animate-fade-up">
          {/* Admin Badge */}
          <div className="inline-block px-3 py-1 bg-error-light text-error rounded-full text-xs font-bold uppercase tracking-widest">
            🔐 Admin Access
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Sign In to Admin Panel
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              This portal is restricted to authorized Serviqo staff only.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-error-light border border-error rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span className="text-sm text-error">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-text-tertiary pointer-events-none" strokeWidth={2} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="admin@serviqo.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-text-tertiary pointer-events-none" strokeWidth={2} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-text-tertiary hover:text-text-secondary"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {/* 2FA Code Field */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">
                Access Code
              </label>
              <p className="text-xs text-text-tertiary mb-3">
                Enter the 6-digit code from your authenticator app
              </p>
              <OtpInput
                length={6}
                onComplete={handleAccessCodeComplete}
                isError={!!error && error.includes('access code')}
              />
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-text-tertiary text-center justify-center pt-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
              All login attempts are logged and monitored.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:bg-primary-light disabled:text-text-tertiary transition-colors text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="p-3 bg-primary-subtle rounded-lg border border-primary-light text-xs text-text-secondary space-y-1">
            <p className="font-semibold text-text-primary">Demo Credentials:</p>
            <p>Email: admin@serviqo.com</p>
            <p>Password: admin123</p>
            <p>Code: 000000 or 123456</p>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
