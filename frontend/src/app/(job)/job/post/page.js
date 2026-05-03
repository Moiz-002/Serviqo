'use client';

import React, { useState, useReducer } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Wrench,
  Camera,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CITIES, BUDGET_RANGES, URGENCY_LEVELS } from '@/config/job-constants';
import FormField from '@/components/ui/FormField';
import FileUpload from '@/components/ui/FileUpload';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const initialState = {
  step: 1,
  category: '',
  title: '',
  description: '',
  city: '',
  area: '',
  budget: '',
  urgency: '',
  images: [],
  imagePreviews: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'PREV_STEP':
      return { ...state, step: state.step - 1 };
    case 'ADD_IMAGES':
      return { 
        ...state, 
        images: [...state.images, ...action.files],
        imagePreviews: [...state.imagePreviews, ...action.previews]
      };
    case 'REMOVE_IMAGE':
      const newImages = [...state.images];
      const newPreviews = [...state.imagePreviews];
      newImages.splice(action.index, 1);
      newPreviews.splice(action.index, 1);
      return { ...state, images: newImages, imagePreviews: newPreviews };
    default:
      return state;
  }
}

export default function PostJobPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, label: 'Service' },
    { id: 2, label: 'Details' },
    { id: 3, label: 'Location' },
    { id: 4, label: 'Budget' },
    { id: 5, label: 'Review' },
  ];

  const handleNext = () => {
    if (validateStep()) {
      dispatch({ type: 'NEXT_STEP' });
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const validateStep = () => {
    if (state.step === 1 && !state.category) return false;
    if (state.step === 2 && (!state.title || !state.description)) return false;
    if (state.step === 3 && (!state.city || !state.area)) return false;
    if (state.step === 4 && (!state.budget || !state.urgency)) return false;
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/job/success');
    }, 2000);
  };

  const handleFilesChange = (files) => {
    const previews = files.map(file => URL.createObjectURL(file));
    dispatch({ type: 'ADD_IMAGES', files, previews });
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary-500" />
              Post a New Job
            </h1>
            <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              Step {state.step} of 5
            </span>
          </div>
          
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-200 -translate-y-1/2 -z-10 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 -z-10 rounded-full transition-all duration-500"
              style={{ width: `${((state.step - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${state.step >= s.id ? 'bg-primary-500 text-white shadow-lg' : 'bg-white border-2 border-neutral-200 text-neutral-400'}
                `}>
                  {state.step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${state.step >= s.id ? 'text-primary-600' : 'text-neutral-400'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Step 1: Category */}
          {state.step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-neutral-900">What service do you need?</h2>
                <p className="text-neutral-500 mt-2">Select the category that best matches your requirement.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => dispatch({ type: 'SET_FIELD', field: 'category', value: cat.id })}
                    className={`
                      p-6 rounded-3xl border-2 transition-all duration-300 group text-left
                      ${state.category === cat.id 
                        ? 'border-primary-500 bg-white shadow-xl shadow-primary-500/10 scale-[1.02]' 
                        : 'border-white bg-white hover:border-primary-200 hover:shadow-lg'}
                    `}
                  >
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-colors
                      ${state.category === cat.id ? 'bg-primary-500 text-white' : 'bg-neutral-100 group-hover:bg-primary-50'}
                    `}>
                      {cat.icon}
                    </div>
                    <h3 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{cat.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Job Details */}
          {state.step === 2 && (
            <Card className="p-8 space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-primary-50 text-primary-500 rounded-2xl">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Job Description</h2>
                  <p className="text-neutral-500 text-sm">Tell us exactly what needs to be done.</p>
                </div>
              </div>

              <div className="space-y-6">
                <FormField label="Job Title" required hint="Short, catchy title (e.g., 'Broken Water Pump Repair')">
                  <input
                    type="text"
                    value={state.title}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'title', value: e.target.value })}
                    placeholder="Enter job title"
                    className="w-full px-5 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </FormField>

                <FormField label="Detailed Description" required hint="Include specific issues, model numbers, or special requirements.">
                  <textarea
                    rows={6}
                    value={state.description}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
                    placeholder="Example: My kitchen drain is clogged and water is backing up. Need help today. I live on the 2nd floor, elevator available."
                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all resize-none"
                  ></textarea>
                </FormField>
              </div>
            </Card>
          )}

          {/* Step 3: Location */}
          {state.step === 3 && (
            <Card className="p-8 space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-accent-50 text-accent-600 rounded-2xl">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Where is the job?</h2>
                  <p className="text-neutral-500 text-sm">Help professionals calculate travel time and costs.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Select City" required>
                  <select
                    value={state.city}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'city', value: e.target.value })}
                    className="w-full px-5 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-primary-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Choose city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>

                <FormField label="Area / Neighborhood" required>
                  <input
                    type="text"
                    value={state.area}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'area', value: e.target.value })}
                    placeholder="e.g. DHA Phase 2, G-11"
                    className="w-full px-5 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-primary-500 transition-all"
                  />
                </FormField>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-500 italic">
                  Note: Your exact street address will only be shared with the professional you hire.
                </p>
              </div>
            </Card>
          )}

          {/* Step 4: Budget & Urgency */}
          {state.step === 4 && (
            <div className="space-y-8">
              <section className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Wrench className="w-5 h-5" /></div>
                  Budget Range
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {BUDGET_RANGES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => dispatch({ type: 'SET_FIELD', field: 'budget', value: b.id })}
                      className={`
                        p-5 rounded-2xl border-2 text-left transition-all
                        ${state.budget === b.id ? 'border-primary-500 bg-primary-50' : 'border-neutral-100 bg-neutral-50/50 hover:border-primary-200'}
                      `}
                    >
                      <h4 className="font-bold text-neutral-900">{b.label}</h4>
                      <p className="text-primary-600 font-bold text-sm mt-1">{b.range}</p>
                      <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{b.description}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></div>
                  How soon do you need help?
                </h3>
                <div className="flex flex-wrap gap-3">
                  {URGENCY_LEVELS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => dispatch({ type: 'SET_FIELD', field: 'urgency', value: u.id })}
                      className={`
                        px-6 py-4 rounded-2xl border-2 text-center transition-all min-w-[140px]
                        ${state.urgency === u.id ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-neutral-100 bg-neutral-50 hover:border-primary-200'}
                      `}
                    >
                      <p className="font-bold text-neutral-900">{u.label}</p>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 mt-1 font-bold">{u.time}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Camera className="w-5 h-5" /></div>
                  Reference Photos
                </h3>
                <p className="text-sm text-neutral-500 mb-6">Uploading clear photos of the problem area helps you get more accurate bids.</p>
                
                <FileUpload 
                  multiple 
                  onFilesChange={handleFilesChange}
                  label="Upload reference photos (optional)"
                />

                {state.imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
                    {state.imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 group">
                        <img src={preview} alt="Reference" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => dispatch({ type: 'REMOVE_IMAGE', index })}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Step 5: Review */}
          {state.step === 5 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-neutral-900">Review & Post</h2>
                <p className="text-neutral-500 mt-2">Check everything before making your job public.</p>
              </div>

              <Card className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Service Category</h4>
                    <p className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                      {CATEGORIES.find(c => c.id === state.category)?.icon}
                      {CATEGORIES.find(c => c.id === state.category)?.name}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Location</h4>
                    <p className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent-600" />
                      {state.area}, {state.city}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Job Title</h4>
                    <p className="text-xl font-bold text-neutral-900">{state.title}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Description</h4>
                    <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{state.description}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Estimated Budget</h4>
                    <p className="text-lg font-bold text-emerald-600">
                      {BUDGET_RANGES.find(b => b.id === state.budget)?.range}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Urgency</h4>
                    <p className="text-lg font-bold text-amber-600">
                      {URGENCY_LEVELS.find(u => u.id === state.urgency)?.label} ({URGENCY_LEVELS.find(u => u.id === state.urgency)?.time})
                    </p>
                  </div>
                </div>

                {state.imagePreviews.length > 0 && (
                  <div className="pt-8 border-t border-neutral-100">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Reference Images</h4>
                    <div className="flex flex-wrap gap-3">
                      {state.imagePreviews.map((p, i) => (
                        <img key={i} src={p} alt="Reference" className="w-20 h-20 rounded-xl object-cover border border-neutral-200" />
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <div className="p-6 bg-primary-900 text-white rounded-3xl flex items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-800 rounded-full -mr-16 -mt-16 opacity-30"></div>
                <div className="p-4 bg-white/10 rounded-2xl shrink-0 backdrop-blur-md">
                  < Sparkles className="w-8 h-8 text-accent-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">AI Matching Enabled</h4>
                  <p className="text-primary-100 text-sm mt-1">We&apos;ll notify the top 10% of rated professionals in your area immediately.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="mt-12 flex items-center justify-between border-t border-neutral-200 pt-8">
          <button
            onClick={handleBack}
            className={`
              flex items-center gap-2 px-6 py-3 font-bold text-neutral-600 rounded-2xl hover:bg-neutral-100 transition-all
              ${state.step === 1 ? 'invisible' : ''}
            `}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {state.step < 5 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep()}
              className="flex items-center gap-2 px-8 py-3 bg-primary-500 text-white rounded-2xl font-bold hover:bg-primary-600 disabled:bg-neutral-200 disabled:text-neutral-400 transition-all shadow-lg shadow-primary-500/20"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-4 bg-primary-600 text-white rounded-3xl font-bold hover:bg-primary-700 disabled:bg-primary-300 transition-all shadow-xl shadow-primary-600/30 scale-110"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Posting...
                </>
              ) : (
                <>
                  Post Your Job Now
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
