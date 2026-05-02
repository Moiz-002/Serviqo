'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSuccess(true);
  };

  const handleFieldChange = (field, value) => {
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-md p-9 border border-border space-y-6 animate-fade-up">
          {!isSuccess ? (
            <>
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Set New Password</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Create a strong password to secure your account.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleReset} className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-text-tertiary" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
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
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-error mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Password Strength */}
                <PasswordStrength password={password} />

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-text-tertiary" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-2.5 rounded-lg border transition-all ${
                        errors.confirmPassword
                          ? 'border-error bg-error-light text-error'
                          : 'border-border focus:border-border-focus focus:ring-2 focus:ring-border-focus'
                      } outline-none text-text-primary placeholder-text-tertiary`}
                    />
                    <button
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-text-tertiary hover:text-text-secondary transition-colors"
                      type="button"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-error mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
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
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
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
                <h2 className="text-2xl font-bold text-text-primary">Password Reset Successful</h2>
                <p className="text-sm text-text-secondary">
                  Your password has been successfully updated. You can now log in with your new password.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full py-2.5 rounded-full bg-primary text-primary-fg font-semibold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
                >
                  Go to Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
