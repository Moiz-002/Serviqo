'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import * as api from '@/lib/api';
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


export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email or phone number is required';
    } else {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isValidPhone = /^\d{10}$/.test(email.replace(/\D/g, ''));
      if (!isValidEmail && !isValidPhone) {
        newErrors.email = 'Please enter a valid email or phone number';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const data = await api.login({ identifier: email, password });
      const role = data.user?.role;
      if (role === 'worker') {
        router.push('/worker/dashboard');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err) {
      setIsLoading(false);
      if (err.status === 403 && err.data?.userId) {
        localStorage.setItem('pendingUserId', err.data.userId);
        router.push('/verify');
        return;
      }
      setErrors({ general: err.message || 'Invalid credentials' });
    }
  };

  const handleFieldChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-surface rounded-2xl shadow-md p-9 border border-border space-y-6 animate-fade-up">
          {/* Portal Selector */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-subtle border border-primary-light rounded-full">
              <span className="text-xs font-semibold text-text-brand uppercase tracking-wide">
                {role === 'customer' ? 'CUSTOMER PORTAL' : 'WORKER PORTAL'}
              </span>
            </div>
            <button
              onClick={() => setRole(role === 'customer' ? 'worker' : 'customer')}
              className="text-sm text-text-secondary border-2 border-text-accent px-2 py-1 cursor-pointer hover:text-text-accent font-medium transition-colors"
            >
              Switch to {role === 'customer' ? 'Worker' : 'Customer'}
            </button>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Welcome Back</h2>
            <p className="text-sm text-text-secondary mt-1">Enter your credentials to access your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-error-light border border-error rounded-lg text-sm text-error">
                {errors.general}
              </div>
            )}
            {/* Email or Phone */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-text-tertiary" />
                <input
                  id="email"
                  type="text"
                  placeholder="name@example.com or +92..."
                  value={email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all ${
                    errors.email
                      ? 'border-error bg-error-light text-error'
                      : 'border-border focus:border-border-focus focus:ring-2 focus:ring-border-focus'
                  } outline-none text-text-primary placeholder-text-tertiary`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-error mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                  Password
                </label>
                <a href="/forgot-password" className="text-sm font-medium text-text-accent hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-text-tertiary" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-2.5 rounded-lg border transition-all ${
                    errors.password
                      ? 'border-error bg-error-light text-error'
                      : 'border-border focus:border-border-focus focus:ring-2 focus:ring-border-focus'
                  } outline-none text-text-primary placeholder-text-tertiary`}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-text-tertiary hover:text-text-secondary transition-colors"
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-error mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-full bg-primary text-primary-fg font-semibold hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6 shadow-sm hover:shadow-md cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full cursor-pointer animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google OAuth */}
          <button className="w-full py-2.5 border border-border rounded-full hover:bg-neutral-100 cursor-pointer transition-colors flex items-center justify-center gap-2 font-semibold text-text-primary shadow-sm hover:shadow-md">     
              <Image src="/google_logo.png" alt="Google" width={18} height={18} />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-tertiary uppercase tracking-wide">Or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* OTP Login */}
          <button
            onClick={() => router.push('/login-otp')}
            className="w-full py-2.5 border border-border rounded-full hover:bg-neutral-100 cursor-pointer transition-colors flex items-center justify-center gap-2 font-semibold text-text-primary shadow-sm hover:shadow-md"
          >
            <ShieldCheck className="w-5 h-5" />
            Login with OTP
          </button>

          {/* Sign Up Link */}
          <div className="border-t border-border pt-4 text-center space-y-2">
            <p className="text-sm text-text-secondary">Don't have an account yet?</p>
            <a
              href="/signup"
              className="block text-text-accent font-semibold hover:underline transition-colors"
            >
              Create an account
            </a>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center mt-6 text-xs text-text-tertiary">
          By logging in, you agree to Serviqo's{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </AuthShell>
  );
}
