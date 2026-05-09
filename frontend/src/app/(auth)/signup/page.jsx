'use client';

import { useState, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';
import {
  User,
  Mail,
  Lock,
  EyeOff,
  Eye,
  Phone,
  Upload,
  Camera,
  X,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { StepIndicator } from '@/components/auth/StepIndicator';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { OtpInput } from '@/components/auth/OtpInput';
import Button from '@/components/ui/Button';

const initialState = {
  step: 1,
  fullName: '',
  phone: '',
  email: '',
  role: null,
  password: '',
  confirmPassword: '',
  cnicFront: null,
  cnicBack: null,
  errors: {},
  isLoading: false,
  showPassword: false,
  showConfirmPassword: false,
  userId: null,
  timeLeft: 59,
  showResend: false,
};

const signupReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.field]: action.error } };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    case 'SET_STEP':
      return { ...state, step: action.step, errors: {} };
    case 'SET_LOADING':
      return { ...state, isLoading: action.value };
    case 'SET_TIME_LEFT':
      return { ...state, timeLeft: action.value };
    case 'SET_SHOW_RESEND':
      return { ...state, showResend: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const validateStep1 = (state) => {
  const errors = {};

  if (!state.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (state.fullName.trim().length < 3) {
    errors.fullName = 'Name must be at least 3 characters';
  } else if (!/^[a-zA-Z\s-]+$/.test(state.fullName)) {
    errors.fullName = 'Name can only contain letters, spaces, and hyphens';
  }

  if (!state.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(state.phone.replace(/\D/g, ''))) {
    errors.phone = 'Phone number must be exactly 10 digits';
  }

  if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.email = 'Please enter a valid email address';
  }

  return errors;
};

const validateStep2 = (state) => {
  if (!state.role) {
    return { role: 'Please select a role' };
  }
  return {};
};

const validateStep3 = (state) => {
  const errors = {};

  if (!state.password) {
    errors.password = 'Password is required';
  } else if (state.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/[A-Z]/.test(state.password)) {
    errors.password = 'Password must contain at least one uppercase letter';
  } else if (!/[0-9]/.test(state.password)) {
    errors.password = 'Password must contain at least one number';
  } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(state.password)) {
    errors.password = 'Password must contain at least one special character';
  }

  if (!state.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (state.password !== state.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export default function SignupPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(signupReducer, initialState);

  const handleFieldChange = (field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
    dispatch({ type: 'SET_ERROR', field, error: null });
  };

  useEffect(() => {
    if (state.step === 4) {
      if (state.timeLeft <= 0) {
        dispatch({ type: 'SET_SHOW_RESEND', value: true });
        return;
      }
      const timer = setInterval(() => {
        dispatch({ type: 'SET_TIME_LEFT', value: state.timeLeft - 1 });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.step, state.timeLeft]);

  const handleNext = async () => {
    let errors = {};

    if (state.step === 1) {
      errors = validateStep1(state);
      if (Object.keys(errors).length === 0) {
        dispatch({ type: 'SET_LOADING', value: true });
        try {
          const { phoneAvailable, emailAvailable } = await api.checkAvailability({
            phone: '+92' + state.phone,
            email: state.email || undefined,
          });

          if (!phoneAvailable) {
            errors.phone = 'This phone number is already registered';
          }
          if (!emailAvailable) {
            errors.email = 'This email address is already registered';
          }
        } catch (err) {
          dispatch({ type: 'SET_ERROR', field: 'general', error: 'Failed to check availability. Please try again.' });
          dispatch({ type: 'SET_LOADING', value: false });
          return;
        }
        dispatch({ type: 'SET_LOADING', value: false });
      }
    } else if (state.step === 2) {
      errors = validateStep2(state);
    } else if (state.step === 3) {
      errors = validateStep3(state);
      if (Object.keys(errors).length === 0) {
        handleSubmit();
        return;
      }
    }

    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach((field) => {
        dispatch({ type: 'SET_ERROR', field, error: errors[field] });
      });
      return;
    }

    if (state.step < 3) {
      dispatch({ type: 'SET_STEP', step: state.step + 1 });
    }
  };

  const handleBack = () => {
    if (state.step > 1 && state.step < 4) {
      dispatch({ type: 'SET_STEP', step: state.step - 1 });
    }
  };

  const handleSubmit = async () => {
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      const data = await api.signup({
        name: state.fullName,
        phone: '+92' + state.phone,
        email: state.email || undefined,
        role: state.role,
        password: state.password,
      });
      dispatch({ type: 'SET_FIELD', field: 'userId', value: data.userId });
      localStorage.setItem('pendingUserId', data.userId);
      localStorage.setItem('pendingPhone', '+92' + state.phone);
      if (data.otp) {
        console.log('DEV OTP:', data.otp);
        localStorage.setItem('devOtp', data.otp);
      }
      
      // Handle CNIC if worker (though redirecting to onboarding soon)
      if (state.role === 'worker' && (state.cnicFront?.preview || state.cnicBack?.preview)) {
        try {
          sessionStorage.setItem('pendingCnic', JSON.stringify({
            front: state.cnicFront?.preview || null,
            back: state.cnicBack?.preview || null,
          }));
        } catch {}
      }

      dispatch({ type: 'SET_LOADING', value: false });
      dispatch({ type: 'SET_STEP', step: 4 });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', field: 'general', error: err.message });
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  const handleOtpComplete = async (otp) => {
    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', field: 'otp', error: null });

    const userId = state.userId || localStorage.getItem('pendingUserId');
    if (!userId) {
      dispatch({ type: 'SET_ERROR', field: 'otp', error: 'Session expired. Please start again.' });
      dispatch({ type: 'SET_LOADING', value: false });
      return;
    }

    try {
      const data = await api.verifyOtp({ userId, otp });
      localStorage.removeItem('pendingUserId');
      localStorage.removeItem('pendingPhone');
      localStorage.removeItem('devOtp');

      const role = data.user?.role || state.role;
      
      // Upload CNIC if available and role is worker
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
        } catch (e) {
          console.error('CNIC upload failed:', e);
        }
        router.push('/onboarding');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', field: 'otp', error: err.message || 'Invalid code.' });
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  const handleResendOtp = async () => {
    dispatch({ type: 'SET_TIME_LEFT', value: 59 });
    dispatch({ type: 'SET_SHOW_RESEND', value: false });
    const userId = state.userId || localStorage.getItem('pendingUserId');
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
      <div className="w-full max-w-md">
        <StepIndicator currentStep={state.step} completedSteps={Array.from({ length: state.step - 1 }, (_, i) => i + 1)} />

        {/* Step 1: Profile */}
        {state.step === 1 && <Step1 state={state} handleFieldChange={handleFieldChange} />}

        {/* Step 2: Details */}
        {state.step === 2 && <Step2 state={state} handleFieldChange={handleFieldChange} />}

        {/* Step 3: Security */}
        {state.step === 3 && <Step3 state={state} handleFieldChange={handleFieldChange} />}

        {/* Step 4: Verification */}
        {state.step === 4 && (
          <StepVerify 
            state={state} 
            handleOtpComplete={handleOtpComplete} 
            handleResend={handleResendOtp}
          />
        )}

        {state.errors.general && (
          <div className="mt-4 p-4 bg-error-light border border-error/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error shrink-0" />
            <p className="text-sm text-error font-medium">{state.errors.general}</p>
          </div>
        )}

        {/* Action Buttons */}
        {state.step < 4 && (
          <div className="flex gap-3 mt-8 justify-center">
            {state.step > 1 && (
              <Button
                variant="outline"
                size="md"
                disabled={state.isLoading}
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              disabled={state.isLoading}
              isLoading={state.isLoading}
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {!state.isLoading && (
                <>
                  {state.step === 3 ? 'Create Account' : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-8 border-t border-border">
          <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wide text-text-secondary">
            <CheckCircle className="w-4 h-4 text-success" />
            SSL Secured
          </div>
          <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wide text-text-secondary">
            <CheckCircle className="w-4 h-4 text-success" />
            Verified Professionals
          </div>
        </div>
      </div>
    </AuthShell>
  );
}

// ============================================================================
// STEP 4: VERIFY (OTP)
// ============================================================================
const StepVerify = ({ state, handleOtpComplete, handleResend }) => {
  const maskedPhone = state.phone ? `+92 ${state.phone.slice(0, 3)} ****${state.phone.slice(-3)}` : 'your number';

  return (
    <div className="bg-surface rounded-2xl shadow-sm p-8 border border-border space-y-6 animate-fade-up text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-primary-subtle flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-text-primary">Verify Your Phone</h2>
        <p className="text-sm text-text-secondary">We've sent a 6-digit code to</p>
        <p className="text-sm font-semibold text-text-brand">{maskedPhone}</p>
      </div>

      {state.errors.otp && (
        <div className="p-4 bg-error-light border border-error rounded-lg flex items-center gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">{state.errors.otp}</p>
        </div>
      )}

      <OtpInput length={6} onComplete={handleOtpComplete} isError={!!state.errors.otp} />

      <div className="space-y-4 pt-2">
        {!state.showResend ? (
          <p className="text-sm text-text-secondary flex items-center justify-center gap-1">
            <RotateCcw className="w-4 h-4" />
            Resend code in {String(state.timeLeft).padStart(2, '0')}s
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="flex items-center justify-center gap-1.5 text-text-accent hover:text-accent font-semibold transition-colors w-full"
          >
            <RotateCcw className="w-4 h-4" />
            Resend Verification Code
          </button>
        )}
      </div>

      <p className="text-xs text-text-secondary border-t border-border pt-4">
        Didn't receive a code? Check your SMS or contact support.
      </p>
    </div>
  );
};


// ============================================================================
// STEP 1: PROFILE
// ============================================================================
const Step1 = ({ state, handleFieldChange }) => {
  return (
    <div className="bg-surface rounded-2xl shadow-sm p-8 border border-border animate-fade-up">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Create Your Account</h2>
      <p className="text-sm text-text-secondary mb-6">Start by sharing some basic information with us.</p>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-text-primary mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 w-5 h-5 text-text-tertiary" />
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={state.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all ${
                state.errors.fullName
                  ? 'border-error bg-error-light text-error'
                  : 'border-border focus:border-border-focus focus:ring-2 focus:ring-border-focus'
              } outline-none text-text-primary placeholder-text-tertiary`}
            />
          </div>
          {state.errors.fullName && (
            <p className="text-sm text-error mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {state.errors.fullName}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
            Phone Number (Pakistan)
          </label>
          <div className="flex rounded-lg border border-border overflow-hidden focus-within:border-border-focus focus-within:ring-2 focus-within:ring-border-focus">
            <div className="px-3 py-2.5 bg-primary-subtle border-r border-border flex items-center whitespace-nowrap text-sm font-medium text-text-primary">
              +92
            </div>
            <div className="relative flex items-center flex-1">
              <Phone className="absolute left-3 w-5 h-5 text-text-tertiary pointer-events-none" />
              <input
                id="phone"
                type="text"
                placeholder="3XX XXXXXXX"
                maxLength="10"
                value={state.phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  handleFieldChange('phone', cleaned);
                }}
                className="w-full pl-10 pr-4 py-2.5 border-none outline-none text-text-primary placeholder-text-tertiary"
              />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-1.5">
            We'll send a 6-digit OTP to this number for verification.
          </p>
          {state.errors.phone && (
            <p className="text-sm text-error mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {state.errors.phone}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            Email Address <span className="text-xs text-text-tertiary">(Optional)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-text-tertiary" />
            <input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={state.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all ${
                state.errors.email
                  ? 'border-error bg-error-light text-error'
                  : 'border-border focus:border-border-focus focus:ring-2 focus:ring-border-focus'
              } outline-none text-text-primary placeholder-text-tertiary`}
            />
          </div>
          {state.errors.email && (
            <p className="text-sm text-error mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {state.errors.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 2: DETAILS
// ============================================================================
const Step2 = ({ state, handleFieldChange }) => {
  const roleOptions = [
    {
      id: 'customer',
      label: "I'm a Customer",
      description: 'Post jobs and hire professionals',
      icon: User,
    },
    {
      id: 'worker',
      label: "I'm a Professional",
      description: 'Find jobs and grow your business',
      icon: Phone,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {roleOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = state.role === option.id;

        return (
          <button
            key={option.id}
            onClick={() => handleFieldChange('role', option.id)}
            className={`w-full p-6 rounded-2xl border-2 transition-all ${
              isSelected
                ? 'border-primary bg-primary-subtle shadow-md'
                : 'border-border bg-surface hover:border-border-strong hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-accent' : 'bg-primary-subtle'
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-text-inverse' : 'text-text-tertiary'}`} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-text-primary">{option.label}</h3>
                <p className="text-sm text-text-secondary mt-1">{option.description}</p>
              </div>
              {isSelected && (
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
              )}
            </div>
          </button>
        );
      })}

      {state.errors.role && (
        <div className="p-4 bg-error-light border border-error rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">{state.errors.role}</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// STEP 3: SECURITY
// ============================================================================
const Step3 = ({ state, handleFieldChange }) => {
  return (
    <div className="bg-surface rounded-2xl shadow-sm p-8 border border-border space-y-6 animate-fade-up">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
          Create Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-text-tertiary" />
          <input
            id="password"
            type={state.showPassword ? 'text' : 'password'}
            placeholder="Enter a strong password"
            value={state.password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            className={`w-full pl-10 pr-12 py-2.5 rounded-lg border transition-all ${
              state.errors.password
                ? 'border-error bg-error-light text-error'
                : 'border-border focus:border-border-focus focus:ring-2 focus:ring-border-focus'
            } outline-none`}
          />
          <button
            onClick={() => handleFieldChange('showPassword', !state.showPassword)}
            className="absolute right-3 top-3 text-text-tertiary hover:text-text-secondary"
            type="button"
            aria-label={state.showPassword ? 'Hide password' : 'Show password'}
          >
            {state.showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {state.errors.password && (
          <p className="text-sm text-error mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {state.errors.password}
          </p>
        )}

        {/* Password Strength */}
        <div className="mt-4">
          <PasswordStrength password={state.password} />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-text-tertiary" />
          <input
            id="confirmPassword"
            type={state.showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={state.confirmPassword}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
            className={`w-full pl-10 pr-12 py-2.5 rounded-lg border transition-all ${
              state.errors.confirmPassword
                ? 'border-error bg-error-light text-error'
                : 'border-border focus:border-border-focus focus:ring-2 focus:ring-border-focus'
            } outline-none`}
          />
          <button
            onClick={() => handleFieldChange('showConfirmPassword', !state.showConfirmPassword)}
            className="absolute right-3 top-3 text-text-tertiary hover:text-text-secondary"
            type="button"
            aria-label={state.showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {state.showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {state.errors.confirmPassword && (
          <p className="text-sm text-error mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {state.errors.confirmPassword}
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// STEP 4: WORKER VERIFICATION
// ============================================================================
const Step4Worker = ({ state, handleFieldChange }) => {
  const uploadCard = (label, field, errors) => {
    const file = state[field];

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-ai text-white flex items-center justify-center font-bold text-sm">
            {field === 'cnicFront' ? '1' : '2'}
          </div>
          <p className="text-sm font-medium text-text-primary">{label}</p>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            errors
              ? 'border-error bg-error-light'
              : 'border-border bg-surface hover:border-primary hover:bg-primary-subtle'
          }`}
        >
          {file?.preview ? (
            <div className="relative inline-block">
              <img
                src={file.preview}
                alt={label}
                className="h-40 rounded-lg object-cover"
              />
              <button
                onClick={() => handleFieldChange(field, null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-error text-text-inverse rounded-full flex items-center justify-center hover:bg-error-hover"
                type="button"
                aria-label={`Remove ${label}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
              </div>
              <p className="font-semibold text-text-primary">Upload {label}</p>
              <p className="text-xs text-text-secondary">PNG, JPG up to 5MB</p>

              <div className="flex gap-2 justify-center pt-2">
                <label className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-primary-subtle cursor-pointer inline-flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Camera
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFieldChange(field, e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                <label className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-primary-subtle cursor-pointer inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFieldChange(field, e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {errors && (
          <p className="text-sm text-error flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors}
          </p>
        )}

        <p className="text-xs text-text-secondary">
          {field === 'cnicFront'
            ? 'Ensure all text, your photo, and the CNIC number are clearly legible.'
            : 'Make sure the barcode and address section are not covered or blurry.'}
        </p>
      </div>
    );
  };

  return (
    <div className=" flex flex-col justify-center align-center space-y-6 animate-fade-up">
      <h2 className="text-2xl font-bold text-text-primary text-center">Identity Verification</h2>
      <p className="text-sm text-text-secondary text-center">
        To start working on Serviqo, we need to verify your identity. Please provide clear photos
        of your original CNIC.
      </p>

      <div className=" gap-6 flex flex-col sm:flex-row justify-center align-center">
        <div className="bg-surface rounded-2xl shadow-sm p-6 border border-border">
          {uploadCard('Front Side', 'cnicFront', state.errors.cnicFront)}
        </div>

        <div className="bg-surface rounded-2xl shadow-sm p-6 border border-border">
          {uploadCard('Back Side', 'cnicBack', state.errors.cnicBack)}
        </div>
      </div>

      {/* Privacy & Security Notice */}
      <div className="bg-primary-subtle border border-primary-light rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-text-brand flex items-center gap-2">
          🔒 Privacy & Data Security
        </p>
        <p className="text-xs text-text-secondary">
          Your CNIC data is encrypted using 256-bit protocols. We only use this information for
          mandatory identity verification required by local labor regulations. Images are stored in
          a secure vault and never shared with third parties.
        </p>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {['Quality Check', 'Original Documents', 'Expired CNIC'].map((tip, idx) => (
          <div key={idx} className="border border-border rounded-lg p-3 text-sm">
            <p className="font-semibold text-text-primary">✓ {tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SUCCESS SCREEN
// ============================================================================
const SuccessScreen = () => {
  return (
    <div className="bg-surface rounded-2xl shadow-sm p-12 border border-border text-center space-y-6 animate-fade-up">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-success-light flex items-center justify-center animate-scale-in">
          <CheckCircle className="w-12 h-12 text-success" strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-text-primary">Account Created!</h2>
      <p className="text-text-secondary">
        Welcome to Serviqo. You can now post jobs and hire professionals.
      </p>

      <Button variant="primary" size="lg" className="w-full">
        Go to Dashboard
      </Button>
    </div>
  );
};
