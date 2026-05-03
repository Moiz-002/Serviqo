'use client';

import {
  ArrowRight,
  Calendar,
  ImageIcon,
  Wrench,
  User,
  ArrowLeft,
  Zap,
  TrendingUp,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Camera,
  Trash2,
  GripVertical,
  Pencil,
} from 'lucide-react';
import { useReducer, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormField from '@/components/ui/FormField';
import TagInput from '@/components/ui/TagInput';
import FileUpload from '@/components/ui/FileUpload';

import {
  CATEGORIES,
  CITIES,
  RESPONSE_TIMES,
  SERVICE_RADIUS_OPTIONS,
  DAYS_OF_WEEK,
  HOURS,
} from '@/config/worker-constants';

const MARKET_RATES = {
  electrical: { min: 1200, max: 3500, city: 'Islamabad' },
  plumbing: { min: 800, max: 2500, city: 'Islamabad' },
  carpentry: { min: 1000, max: 3000, city: 'Islamabad' },
  cleaning: { min: 500, max: 1500, city: 'Islamabad' },
  appliance: { min: 1500, max: 4000, city: 'Islamabad' },
  hvac: { min: 2000, max: 5000, city: 'Islamabad' },
};

const initialState = {
  currentStep: 1,
  completedSteps: [],
  displayName: '',
  bio: '',
  city: '',
  area: '',
  yearsExperience: '',
  phone: '+92 300 1234567',
  avatar: null,
  avatarPreview: '',
  primaryCategory: '',
  skills: [],
  certifications: [],
  hourlyRate: '',
  serviceRadius: '',
  portfolioItems: [],
  workingDays: [],
  startTime: '',
  endTime: '',
  instantBooking: false,
  responseTime: '',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_CERTIFICATION':
      return {
        ...state,
        certifications: [
          ...state.certifications,
          { title: '', issuedBy: '', year: new Date().getFullYear() },
        ],
      };
    case 'UPDATE_CERTIFICATION':
      return {
        ...state,
        certifications: state.certifications.map((cert, i) =>
          i === action.index ? { ...cert, [action.field]: action.value } : cert
        ),
      };
    case 'REMOVE_CERTIFICATION':
      return {
        ...state,
        certifications: state.certifications.filter((_, i) => i !== action.index),
      };
    case 'ADD_PORTFOLIO_ITEM':
      return {
        ...state,
        portfolioItems: [
          ...state.portfolioItems,
          { file: action.file, preview: action.preview, caption: '' },
        ],
      };
    case 'UPDATE_PORTFOLIO_CAPTION':
      return {
        ...state,
        portfolioItems: state.portfolioItems.map((item, i) =>
          i === action.index ? { ...item, caption: action.caption } : item
        ),
      };
    case 'REMOVE_PORTFOLIO_ITEM':
      return {
        ...state,
        portfolioItems: state.portfolioItems.filter((_, i) => i !== action.index),
      };
    case 'REORDER_PORTFOLIO':
      const newItems = [...state.portfolioItems];
      const [movedItem] = newItems.splice(action.from, 1);
      newItems.splice(action.to, 0, movedItem);
      return { ...state, portfolioItems: newItems };
    case 'TOGGLE_WORKING_DAY':
      const days = state.workingDays.includes(action.day)
        ? state.workingDays.filter((d) => d !== action.day)
        : [...state.workingDays, action.day];
      return { ...state, workingDays: days };
    case 'ADVANCE_STEP':
      return {
        ...state,
        currentStep: action.step,
        completedSteps: [...new Set([...state.completedSteps, state.currentStep])],
      };
    case 'GO_BACK_STEP':
      return { ...state, currentStep: action.step };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const Step1Profile = ({ state, dispatch, onNext }) => {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateStep1 = () => {
    const newErrors = {};
    if (!state.displayName.trim()) newErrors.displayName = 'Display name is required';
    if (state.displayName.length < 3 || state.displayName.length > 60)
      newErrors.displayName = 'Name must be 3-60 characters';
    if (!/^[a-zA-Z\s]*$/.test(state.displayName))
      newErrors.displayName = 'Name can only contain letters and spaces';
    if (!state.bio.trim()) newErrors.bio = 'Bio is required';
    if (state.bio.length < 50 || state.bio.length > 500)
      newErrors.bio = 'Bio must be 50-500 characters';
    if (!state.city) newErrors.city = 'City is required';
    if (!state.yearsExperience) newErrors.yearsExperience = 'Experience is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep1()) return;
    setIsLoading(true);
    setTimeout(() => {
      dispatch({ type: 'ADVANCE_STEP', step: 2 });
      setIsLoading(false);
    }, 500);
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setErrors({ avatar: 'Image must be under 5MB' });
          return;
        }
        const preview = URL.createObjectURL(file);
        dispatch({ type: 'SET_FIELD', field: 'avatar', value: file });
        dispatch({ type: 'SET_FIELD', field: 'avatarPreview', value: preview });
        setErrors((prev) => {
          const { avatar, ...rest } = prev;
          return rest;
        });
      }
    };
    input.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-surface rounded-3xl shadow-lg p-8 md:p-12">
        <h2 className="text-2xl font-bold text-text-primary">
          Set Up Your Professional Profile
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          This is what customers will see when they browse for professionals.
        </p>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mt-8 mb-8">
          <button
            onClick={handleAvatarClick}
            className="relative w-24 h-24 rounded-full border-2 border-dashed border-primary bg-primary-subtle flex items-center justify-center hover:border-primary hover:bg-primary-light transition-colors group"
          >
            {state.avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.avatarPreview}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-text-tertiary" strokeWidth={1.5} />
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
          </button>
          <button
            onClick={handleAvatarClick}
            className="mt-3 text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Upload Profile Photo
          </button>
          {errors.avatar && (
            <p className="mt-2 text-xs text-error flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.avatar}
            </p>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <FormField
            label="Display Name"
            required
            error={errors.displayName}
            hint="This name will appear on your public profile and bids"
            htmlFor="displayName"
          >
            <input
              id="displayName"
              type="text"
              value={state.displayName}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'displayName', value: e.target.value })
              }
              placeholder="e.g. Ahmad Hassan"
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors"
            />
          </FormField>

          <FormField
            label="Professional Bio"
            required
            error={errors.bio}
            htmlFor="bio"
          >
            <div>
              <textarea
                id="bio"
                value={state.bio}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'bio', value: e.target.value })
                }
                placeholder="Describe your experience, specialties, and what makes you the right choice for customers..."
                rows={4}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors resize-none"
              />
              <div className="flex justify-end mt-2">
                <span
                  className={`text-xs font-medium ${
                    state.bio.length > 500 ? 'text-error' : 'text-text-tertiary'
                  }`}
                >
                  {state.bio.length} / 500
                </span>
              </div>
            </div>
          </FormField>

          <FormField
            label="City"
            required
            error={errors.city}
            htmlFor="city"
          >
            <select
              id="city"
              value={state.city}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'city', value: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233D4F8A' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Area / Neighborhood"
            optional
            htmlFor="area"
          >
            <input
              id="area"
              type="text"
              value={state.area}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'area', value: e.target.value })
              }
              placeholder="e.g. F-7, DHA Phase 5, Gulberg III"
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors"
            />
          </FormField>

          <FormField
            label="Years of Experience"
            required
            error={errors.yearsExperience}
            htmlFor="experience"
          >
            <select
              id="experience"
              value={state.yearsExperience}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'yearsExperience', value: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233D4F8A' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="">Select experience</option>
              <option value="less-1">Less than 1 year</option>
              <option value="1-2">1–2 years</option>
              <option value="3-5">3–5 years</option>
              <option value="6-10">6–10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </FormField>

          <FormField
            label="Phone Number"
            htmlFor="phone"
            hint="Your registered phone number — contact support to change"
          >
            <div className="flex gap-2">
              <div className="px-4 py-2.5 border border-border rounded-lg bg-neutral-50 text-text-secondary font-medium text-sm flex items-center">
                +92
              </div>
              <input
                id="phone"
                type="text"
                value={state.phone}
                disabled
                className="flex-1 px-4 py-2.5 border border-border rounded-lg bg-neutral-50 text-text-disabled cursor-not-allowed"
              />
            </div>
          </FormField>
        </div>

        {/* Action Row */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg rounded-full font-medium hover:bg-primary-hover disabled:bg-primary-light disabled:text-text-tertiary transition-colors"
          >
            Continue to Skills
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Step2Skills = ({ state, dispatch, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [certToRemove, setCertToRemove] = useState(null);

  const selectedCategory = CATEGORIES.find((c) => c.id === state.primaryCategory);
  const marketRate = MARKET_RATES[state.primaryCategory];

  const validateStep2 = () => {
    const newErrors = {};
    if (!state.primaryCategory) newErrors.category = 'Select a service category';
    if (state.skills.length < 2) newErrors.skills = 'Add at least 2 skills';
    if (!state.hourlyRate) newErrors.hourlyRate = 'Hourly rate is required';
    if (isNaN(parseInt(state.hourlyRate)) || parseInt(state.hourlyRate) < 100 || parseInt(state.hourlyRate) > 50000)
      newErrors.hourlyRate = 'Rate must be between 100–50,000 PKR';
    if (!state.serviceRadius) newErrors.serviceRadius = 'Select service radius';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep2()) return;
    setIsLoading(true);
    setTimeout(() => {
      dispatch({ type: 'ADVANCE_STEP', step: 3 });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-surface rounded-3xl shadow-lg p-8 md:p-12">
        <h2 className="text-2xl font-bold text-text-primary">
          Your Skills &amp; Expertise
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Tell customers what you do best. The more specific, the better your matches.
        </p>

        <div className="space-y-8 mt-8">
          {/* Primary Service Category */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-4">
              Primary Service Category
              <span className="text-error font-bold ml-1">*</span>
            </label>
            {errors.category && (
              <p className="text-xs text-error mb-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.category}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    dispatch({ type: 'SET_FIELD', field: 'primaryCategory', value: cat.id });
                    dispatch({ type: 'SET_FIELD', field: 'skills', value: [] });
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 relative ${
                    state.primaryCategory === cat.id
                      ? 'border-primary bg-primary-subtle'
                      : 'border-border bg-surface hover:border-primary hover:bg-primary-subtle'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{cat.icon}</span>
                    {state.primaryCategory === cat.id && (
                      <CheckCircle2 className="w-5 h-5 text-accent" strokeWidth={2} />
                    )}
                  </div>
                  <h3 className="font-semibold text-text-primary">{cat.name}</h3>
                  <p className="text-xs text-text-secondary mt-1">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Skills Tags */}
          {selectedCategory && (
            <FormField
              label="Specific Skills"
              required
              error={errors.skills}
              hint="Add at least 2 skills. These help AI match you to the right jobs."
              htmlFor="skills"
            >
              <TagInput
                value={state.skills}
                onChange={(skills) =>
                  dispatch({ type: 'SET_FIELD', field: 'skills', value: skills })
                }
                suggestions={selectedCategory.skills}
                placeholder="Type a skill or select from suggestions..."
                maxTags={12}
              />
            </FormField>
          )}

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-4">
              Certifications &amp; Qualifications
              <span className="text-xs text-text-tertiary ml-2">(Optional)</span>
            </label>

            <div className="space-y-3 mb-4">
              {state.certifications.map((cert, index) => (
                <div key={`cert-${index}`} className="p-4 border border-border rounded-xl bg-surface">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={cert.title}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_CERTIFICATION',
                          index,
                          field: 'title',
                          value: e.target.value,
                        })
                      }
                      placeholder="Certification Title"
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors"
                    />
                    <input
                      type="text"
                      value={cert.issuedBy}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_CERTIFICATION',
                          index,
                          field: 'issuedBy',
                          value: e.target.value,
                        })
                      }
                      placeholder="Issued By"
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors"
                    />
                    <select
                      value={cert.year}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_CERTIFICATION',
                          index,
                          field: 'year',
                          value: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233D4F8A' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        paddingRight: '28px',
                      }}
                    >
                      {Array.from({ length: 20 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>

                    {certToRemove === index ? (
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => {
                            dispatch({ type: 'REMOVE_CERTIFICATION', index });
                            setCertToRemove(null);
                          }}
                          className="px-3 py-1 bg-error text-white rounded-lg hover:bg-error-active transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => setCertToRemove(null)}
                          className="px-3 py-1 bg-neutral-200 text-text-primary rounded-lg hover:bg-neutral-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCertToRemove(index)}
                        className="text-error hover:text-error-active text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {state.certifications.length < 5 && (
              <button
                onClick={() => dispatch({ type: 'ADD_CERTIFICATION' })}
                className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary-subtle transition-colors flex items-center gap-1"
              >
                + Add Certification
              </button>
            )}
          </div>

          {/* Hourly Rate */}
          <FormField
            label="Your Hourly Rate (PKR)"
            required
            error={errors.hourlyRate}
            hint="Set a competitive rate. Our AI Pricing Advisor shows market averages for your category."
            htmlFor="hourlyRate"
          >
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="px-4 py-2.5 border border-border rounded-lg bg-surface text-text-secondary font-medium text-sm flex items-center">
                  PKR
                </div>
                <input
                  id="hourlyRate"
                  type="number"
                  value={state.hourlyRate}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'hourlyRate', value: e.target.value })
                  }
                  placeholder="e.g. 1500"
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors"
                />
              </div>

              {selectedCategory && marketRate && (
                <div className="p-3 bg-accent-subtle border border-accent-light rounded-xl flex gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-sm text-text-secondary">
                    Market average for {selectedCategory.name} in {state.city || 'Islamabad'}: PKR{' '}
                    <span className="font-semibold text-text-primary">
                      {marketRate.min.toLocaleString()} – {marketRate.max.toLocaleString()}
                    </span>
                    / hour
                  </p>
                </div>
              )}
            </div>
          </FormField>

          {/* Service Radius */}
          <FormField
            label="How far can you travel?"
            required
            error={errors.serviceRadius}
            hint="Select the maximum distance you're willing to travel for jobs"
            htmlFor="serviceRadius"
          >
            <div className="flex flex-wrap gap-2">
              {SERVICE_RADIUS_OPTIONS.map((radius) => (
                <button
                  key={radius}
                  onClick={() =>
                    dispatch({ type: 'SET_FIELD', field: 'serviceRadius', value: radius })
                  }
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    state.serviceRadius === radius
                      ? 'bg-primary text-primary-fg border border-primary'
                      : 'bg-surface border border-border text-text-secondary hover:border-primary'
                  }`}
                >
                  {radius}
                </button>
              ))}
            </div>
          </FormField>
        </div>

        {/* Action Row */}
        <div className="flex justify-between gap-3 mt-8">
          <button
            onClick={() => dispatch({ type: 'GO_BACK_STEP', step: 1 })}
            className="flex items-center gap-2 px-6 py-3 text-primary font-medium hover:bg-primary-subtle rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to Profile
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg rounded-full font-medium hover:bg-primary-hover disabled:bg-primary-light disabled:text-text-tertiary transition-colors"
          >
            Continue to Portfolio
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Step3Portfolio = ({ state, dispatch, onNext, onBack }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilesChange = (files) => {
    files.forEach((file) => {
      const preview = URL.createObjectURL(file);
      dispatch({
        type: 'ADD_PORTFOLIO_ITEM',
        file,
        preview,
      });
    });
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      dispatch({
        type: 'REORDER_PORTFOLIO',
        from: draggedIndex,
        to: targetIndex,
      });
      setDraggedIndex(null);
    }
  };

  const handleSkip = () => {
    dispatch({ type: 'ADVANCE_STEP', step: 4 });
  };

  const handleNext = async () => {
    setIsLoading(true);
    setTimeout(() => {
      dispatch({ type: 'ADVANCE_STEP', step: 4 });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-surface rounded-3xl shadow-lg p-8 md:p-12">
        <h2 className="text-2xl font-bold text-text-primary">
          Showcase Your Work
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Customers are 3x more likely to hire professionals with portfolio photos. Add at least 3 images of your past work.
        </p>

        <div className="mt-8">
          <FormField
            label="Upload Work Photos"
            hint="PNG, JPG, WEBP up to 10MB each. Minimum 1, recommended 3–8 photos."
          >
            <FileUpload
              accept="image/*"
              multiple
              maxSizeMB={10}
              onFilesChange={handleFilesChange}
              value={state.portfolioItems.map((item) => item.file)}
              label="Upload Work Photos"
            />
          </FormField>
        </div>

        {/* Portfolio Grid */}
        {state.portfolioItems.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-text-tertiary">
                {state.portfolioItems.length} / 8 photos uploaded
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {state.portfolioItems.map((item, index) => (
                <div
                  key={`portfolio-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="relative group rounded-xl overflow-hidden cursor-move"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.preview}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        const newCaption = prompt('Edit caption (max 80 chars):', item.caption);
                        if (newCaption !== null) {
                          dispatch({
                            type: 'UPDATE_PORTFOLIO_CAPTION',
                            index,
                            caption: newCaption.slice(0, 80),
                          });
                        }
                      }}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-white" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() =>
                        dispatch({ type: 'REMOVE_PORTFOLIO_ITEM', index })
                      }
                      className="p-2 rounded-full bg-error hover:bg-error-hover transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" strokeWidth={2} />
                    </button>
                  </div>

                  {/* Grip Handle */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>

                  {/* Caption */}
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs text-white truncate">
                      {item.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skip Option */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-text-tertiary hover:text-text-secondary font-medium transition-colors"
          >
            Skip for now — you can add portfolio later
          </button>
        </div>

        {/* Action Row */}
        <div className="flex justify-between gap-3 mt-8">
          <button
            onClick={() => dispatch({ type: 'GO_BACK_STEP', step: 2 })}
            className="flex items-center gap-2 px-6 py-3 text-primary font-medium hover:bg-primary-subtle rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to Skills
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg rounded-full font-medium hover:bg-primary-hover disabled:bg-primary-light disabled:text-text-tertiary transition-colors"
          >
            Continue to Availability
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Step4Availability = ({ state, dispatch, onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const validateStep4 = () => {
    return state.workingDays.length > 0 && state.startTime && state.endTime && state.responseTime;
  };

  const handleComplete = async () => {
    if (!validateStep4()) return;
    setIsLoading(true);
    setTimeout(() => {
      onComplete();
      setIsLoading(false);
    }, 2000);
  };

  const startHour = HOURS.indexOf(state.startTime);
  const endHour = HOURS.indexOf(state.endTime);
  const isValidTimeRange = startHour >= 0 && endHour >= 0 && endHour > startHour;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-surface rounded-3xl shadow-lg p-8 md:p-12">
        <h2 className="text-2xl font-bold text-text-primary">
          Set Your Availability
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Let customers know when you&apos;re available. You can update this anytime from your dashboard.
        </p>

        <div className="space-y-8 mt-8">
          {/* Working Days */}
          <FormField
            label="Working Days"
            required
            error={state.workingDays.length === 0 ? 'Select at least 1 day' : ''}
            hint="Select the days you typically accept work"
          >
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  onClick={() =>
                    dispatch({ type: 'TOGGLE_WORKING_DAY', day })
                  }
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    state.workingDays.includes(day)
                      ? 'bg-primary text-primary-fg border border-primary'
                      : 'bg-surface border border-border text-text-secondary hover:border-primary'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </FormField>

          {/* Working Hours */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              Working Hours
              <span className="text-error font-bold ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="From"
                htmlFor="startTime"
              >
                <select
                  id="startTime"
                  value={state.startTime}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'startTime', value: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233D4F8A' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '36px',
                  }}
                >
                  <option value="">Select time</option>
                  {HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="To"
                htmlFor="endTime"
              >
                <select
                  id="endTime"
                  value={state.endTime}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'endTime', value: e.target.value })
                  }
                  disabled={!state.startTime}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors appearance-none disabled:opacity-60"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233D4F8A' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '36px',
                  }}
                >
                  <option value="">Select time</option>
                  {HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            {!isValidTimeRange && state.startTime && state.endTime && (
              <p className="text-xs text-error flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                End time must be after start time
              </p>
            )}
            <p className="text-xs text-text-tertiary">
              Your standard working hours. You can always discuss specific timing with clients.
            </p>
          </div>

          {/* Response Time */}
          <FormField
            label="Typical Response Time"
            required
            error={!state.responseTime ? 'Select a response time' : ''}
            hint="How quickly you typically respond to booking requests"
            htmlFor="responseTime"
          >
            <div className="flex flex-wrap gap-2">
              {RESPONSE_TIMES.map((time) => (
                <button
                  key={time}
                  onClick={() =>
                    dispatch({ type: 'SET_FIELD', field: 'responseTime', value: time })
                  }
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    state.responseTime === time
                      ? 'bg-accent text-accent-fg border border-accent'
                      : 'bg-surface border border-border text-text-secondary hover:border-accent'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </FormField>

          {/* Instant Booking Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="instantBooking" className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium text-text-primary">
                  Accept Instant Bookings
                </span>
              </label>
              <button
                id="instantBooking"
                onClick={() =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'instantBooking',
                    value: !state.instantBooking,
                  })
                }
                role="switch"
                aria-checked={state.instantBooking}
                className={`w-14 h-7 rounded-full transition-colors ${
                  state.instantBooking ? 'bg-accent' : 'bg-border'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform duration-200 ${
                    state.instantBooking ? 'translate-x-7' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-text-secondary">
              Allow customers to book you immediately without waiting for approval
            </p>

            {state.instantBooking && (
              <div className="p-3 bg-accent-subtle border border-accent-light rounded-xl flex gap-2">
                <Zap className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-sm text-text-secondary">
                  Great! You&apos;ll appear at the top of search results for customers who need immediate help.
                </p>
              </div>
            )}
          </div>

          {/* Completion Card */}
          {validateStep4() && (
            <div className="p-6 bg-primary-subtle border border-primary-light rounded-2xl">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-8 h-8 text-accent flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h3 className="font-semibold text-text-primary">You&apos;re all set!</h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-text-secondary">
                    <li>✓ Profile photo + name + bio</li>
                    <li>✓ Service category + {state.skills.length} skills</li>
                    <li>
                      ✓ {state.portfolioItems.length > 0 ? `${state.portfolioItems.length} portfolio photos` : 'Portfolio can be added later'}
                    </li>
                    <li>
                      ✓ Available {state.workingDays.join(', ')}, {state.startTime} – {state.endTime}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="flex justify-between gap-3 mt-8">
          <button
            onClick={() => dispatch({ type: 'GO_BACK_STEP', step: 3 })}
            className="flex items-center gap-2 px-6 py-3 text-primary font-medium hover:bg-primary-subtle rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to Portfolio
          </button>
          <button
            onClick={handleComplete}
            disabled={isLoading || !validateStep4()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg rounded-full font-medium hover:bg-primary-hover disabled:bg-primary-light disabled:text-text-tertiary transition-colors"
          >
            {isLoading ? 'Setting up your profile...' : 'Complete Profile & Go to Dashboard'}
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

const StepIndicatorOnboarding = ({ currentStep = 1, completedSteps = [] }) => {
  const steps = [
    { id: 1, label: 'Profile', icon: User },
    { id: 2, label: 'Skills', icon: Wrench },
    { id: 3, label: 'Portfolio', icon: ImageIcon },
    { id: 4, label: 'Availability', icon: Calendar },
  ];

  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-fg shadow-lg scale-110'
                      : isCompleted
                      ? 'bg-accent text-accent-fg shadow-md'
                      : 'bg-surface border-2 border-border text-text-tertiary'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                  role="img"
                  aria-label={`Step ${step.id}: ${step.label}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  )}
                </div>

                <span
                  className={`text-xs font-semibold uppercase tracking-wide mt-2 ${
                    isActive || isCompleted ? 'text-text-brand' : 'text-text-tertiary'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`h-1.5 w-6 sm:w-10 mx-2 sm:mx-3 rounded-full transition-all duration-300 ${
                    isCompleted || completedSteps.includes(step.id + 1)
                      ? 'bg-navy-600 shadow-sm'
                      : 'bg-neutral-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function OnboardingPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    return () => {
      if (state.avatarPreview) {
        URL.revokeObjectURL(state.avatarPreview);
      }
      state.portfolioItems.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
    };
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('serviqo_onboarded', 'true');
    router.push('/worker/dashboard?welcome=true');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Step Indicator */}
        <div>
          <StepIndicatorOnboarding
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
          />
        </div>

        {/* Step Content */}
        <div className="animate-in fade-in-0 duration-300">
          {state.currentStep === 1 && (
            <Step1Profile state={state} dispatch={dispatch} onNext={() => {}} />
          )}
          {state.currentStep === 2 && (
            <Step2Skills state={state} dispatch={dispatch} onNext={() => {}} onBack={() => {}} />
          )}
          {state.currentStep === 3 && (
            <Step3Portfolio state={state} dispatch={dispatch} onNext={() => {}} onBack={() => {}} />
          )}
          {state.currentStep === 4 && (
            <Step4Availability
              state={state}
              dispatch={dispatch}
              onComplete={handleOnboardingComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
