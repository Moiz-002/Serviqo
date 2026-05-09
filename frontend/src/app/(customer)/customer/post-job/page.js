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
  Sparkles,
  Info,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CITIES, BUDGET_RANGES, URGENCY_LEVELS } from '@/config/job-constants';
import * as api from '@/lib/api';
import FormField from '@/components/ui/FormField';
import FileUpload from '@/components/ui/FileUpload';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StepIndicator } from '@/components/auth/StepIndicator';

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

  const jobSteps = [
    { id: 1, label: 'Service', icon: Wrench },
    { id: 2, label: 'Details', icon: Info },
    { id: 3, label: 'Budget', icon: Briefcase },
    { id: 4, label: 'Review', icon: CheckCircle2 },
  ];

  const handleNext = () => {
    if (validateStep()) {
      dispatch({ type: 'NEXT_STEP' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateStep = () => {
    if (state.step === 1 && !state.category) return false;
    if (state.step === 2 && (!state.title || !state.description || !state.city || !state.area)) return false;
    if (state.step === 3 && (!state.budget || !state.urgency)) return false;
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', state.title);
      formData.append('description', state.description);
      formData.append('category', CATEGORIES.find(c => c.id === state.category)?.name || state.category);
      formData.append('city', state.city);
      formData.append('area', state.area);
      formData.append('budgetRange', BUDGET_RANGES.find(b => b.id === state.budget)?.range || state.budget);
      formData.append('urgency', state.urgency);
      state.images.forEach((file) => formData.append('images', file));
      await api.createJob(formData);
      router.push('/customer/my-jobs');
    } catch (err) {
      console.error('Failed to post job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilesChange = (files) => {
    const previews = files.map(file => URL.createObjectURL(file));
    dispatch({ type: 'ADD_IMAGES', files, previews });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-black text-text-primary tracking-tight">Post Your Job</h1>
        <p className="text-text-secondary mt-2 font-medium text-lg italic">Get matched with the best professionals in minutes.</p>
      </div>

      <StepIndicator 
        currentStep={state.step} 
        completedSteps={Array.from({ length: state.step - 1 }, (_, i) => i + 1)}
        steps={jobSteps}
      />

      <div className="mt-8">
        {state.step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <Card className="p-8 md:p-10 border-neutral-200/60 shadow-lg">
              <h2 className="text-xl font-black text-text-primary mb-8 uppercase tracking-tight">What do you need help with?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      dispatch({ type: 'SET_FIELD', field: 'category', value: cat.id });
                      handleNext();
                    }}
                    className={`
                      p-8 rounded-3xl border-2 transition-all duration-300 group text-left relative overflow-hidden
                      ${state.category === cat.id 
                        ? 'border-primary bg-primary-subtle shadow-xl ring-4 ring-primary/5' 
                        : 'border-neutral-100 bg-white hover:border-primary/30 hover:bg-neutral-50'}
                    `}
                  >
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-colors shadow-sm
                      ${state.category === cat.id ? 'bg-primary text-white' : 'bg-neutral-100 group-hover:bg-primary-subtle'}
                    `}>
                      {cat.icon}
                    </div>
                    <h3 className="font-black text-text-primary text-lg">{cat.name}</h3>
                    <p className="text-[10px] text-text-tertiary mt-2 uppercase tracking-[0.15em] font-black leading-relaxed">{cat.description}</p>
                    {state.category === cat.id && (
                      <div className="absolute -top-1 -right-1">
                        <div className="bg-primary p-1.5 rounded-bl-2xl shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {state.step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <Card className="p-8 md:p-10 border-neutral-200/60 shadow-lg space-y-10">
              <div className="space-y-8">
                <FormField label="Job Title" required hint="e.g., 'Fixing a leaking kitchen tap'">
                  <input
                    type="text"
                    value={state.title}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'title', value: e.target.value })}
                    placeholder="Briefly describe the job"
                    className="w-full px-6 py-4 bg-neutral-50 border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-text-primary"
                  />
                </FormField>

                <FormField label="Full Description" required hint="The more detail, the better the bid.">
                  <textarea
                    rows={5}
                    value={state.description}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
                    placeholder="Example: I have a water leak under the kitchen sink. It drips when the tap is on. Need someone to bring their own tools and fix it today."
                    className="w-full px-6 py-5 bg-neutral-50 border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none font-medium text-text-primary leading-relaxed"
                  ></textarea>
                </FormField>
              </div>

              <div className="pt-10 border-t border-neutral-100 space-y-8">
                <h3 className="text-xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tight">
                  <MapPin className="w-6 h-6 text-accent" />
                  Where is the job?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <FormField label="City" required>
                    <select
                      value={state.city}
                      onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'city', value: e.target.value })}
                      className="w-full px-6 py-4 bg-neutral-50 border border-border rounded-2xl outline-none focus:border-primary transition-all font-black text-text-primary appearance-none cursor-pointer"
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
                      placeholder="e.g. F-10/2, DHA Phase 2"
                      className="w-full px-6 py-4 bg-neutral-50 border border-border rounded-2xl outline-none focus:border-primary transition-all font-black text-text-primary placeholder:text-text-tertiary"
                    />
                  </FormField>
                </div>
              </div>
            </Card>
          </div>
        )}

        {state.step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <Card className="p-8 md:p-10 border-neutral-200/60 shadow-lg space-y-12">
              <section>
                <h3 className="text-xl font-black text-text-primary mb-8 flex items-center gap-3 uppercase tracking-tight">
                  <div className="p-2.5 bg-primary-subtle text-primary rounded-2xl shadow-sm"><Briefcase className="w-6 h-6" /></div>
                  Budget Range
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {BUDGET_RANGES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => dispatch({ type: 'SET_FIELD', field: 'budget', value: b.id })}
                      className={`
                        p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden
                        ${state.budget === b.id ? 'border-primary bg-primary-subtle shadow-xl ring-4 ring-primary/5' : 'border-neutral-100 bg-white hover:border-primary/20'}
                      `}
                    >
                      <h4 className="font-black text-text-primary text-lg">{b.label}</h4>
                      <p className="text-primary font-black text-base mt-1">{b.range}</p>
                      <p className="text-[10px] text-text-tertiary mt-3 font-black uppercase tracking-[0.15em] leading-relaxed">{b.description}</p>
                      {state.budget === b.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              <section className="pt-10 border-t border-neutral-100">
                <h3 className="text-xl font-black text-text-primary mb-8 flex items-center gap-3 uppercase tracking-tight">
                  <div className="p-2.5 bg-warning-light text-warning rounded-2xl shadow-sm"><Clock className="w-6 h-6" /></div>
                  Urgency
                </h3>
                <div className="flex flex-wrap gap-4">
                  {URGENCY_LEVELS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => dispatch({ type: 'SET_FIELD', field: 'urgency', value: u.id })}
                      className={`
                        px-8 py-5 rounded-2xl border-2 text-center transition-all min-w-[160px]
                        ${state.urgency === u.id ? 'border-primary bg-primary-subtle shadow-md' : 'border-neutral-100 bg-white hover:border-primary/20'}
                      `}
                    >
                      <p className="font-black text-text-primary">{u.label}</p>
                      <p className="text-[10px] uppercase tracking-widest text-text-tertiary mt-1.5 font-black">{u.time}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="pt-10 border-t border-neutral-100">
                <h3 className="text-xl font-black text-text-primary mb-6 flex items-center gap-3 uppercase tracking-tight">
                  <div className="p-2.5 bg-info-light text-info rounded-2xl shadow-sm"><Camera className="w-6 h-6" /></div>
                  Reference Photos
                </h3>
                <p className="text-sm text-text-secondary mb-6 font-medium">Clear photos of the problem area help pros provide accurate estimates.</p>
                
                <FileUpload 
                  multiple 
                  onFilesChange={handleFilesChange}
                  label="Drag and drop photos here"
                />

                {state.imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 mt-8">
                    {state.imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-neutral-100 group shadow-lg">
                        <img src={preview} alt="Reference" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => dispatch({ type: 'REMOVE_IMAGE', index })}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </Card>
          </div>
        )}

        {state.step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <Card className="p-8 md:p-12 border-neutral-200/60 shadow-2xl space-y-12 relative overflow-hidden bg-white">
               <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                  <Sparkles className="w-24 h-24 text-primary rotate-12" />
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary mb-3">Service Category</h4>
                  <p className="text-xl font-black text-text-primary flex items-center gap-4">
                    <span className="w-12 h-12 flex items-center justify-center bg-primary-subtle rounded-2xl text-2xl shadow-sm">{CATEGORIES.find(c => c.id === state.category)?.icon}</span>
                    {CATEGORIES.find(c => c.id === state.category)?.name}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary mb-3">Job Location</h4>
                  <p className="text-xl font-black text-text-primary flex items-center gap-4">
                    <span className="w-12 h-12 flex items-center justify-center bg-success-light rounded-2xl shadow-sm"><MapPin className="w-6 h-6 text-success" /></span>
                    {state.area}, {state.city}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary mb-3">Job Details</h4>
                  <p className="text-3xl font-black text-text-primary leading-tight tracking-tight">{state.title}</p>
                  <div className="mt-6 p-6 bg-neutral-50 rounded-[2rem] border border-neutral-100">
                    <p className="text-text-secondary leading-relaxed font-medium whitespace-pre-wrap italic">&quot;{state.description}&quot;</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary mb-3">Estimated Budget</h4>
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-primary-subtle rounded-2xl border border-primary/10">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <p className="text-xl font-black text-primary">
                      {BUDGET_RANGES.find(b => b.id === state.budget)?.range}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary mb-3">Required By</h4>
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-warning-light rounded-2xl border border-warning/10">
                    <Clock className="w-5 h-5 text-warning" />
                    <p className="text-xl font-black text-warning">
                      {URGENCY_LEVELS.find(u => u.id === state.urgency)?.label}
                    </p>
                  </div>
                </div>
              </div>

              {state.imagePreviews.length > 0 && (
                <div className="pt-10 border-t border-neutral-100">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary mb-6">Reference Images ({state.imagePreviews.length})</h4>
                  <div className="flex flex-wrap gap-5">
                    {state.imagePreviews.map((p, i) => (
                      <div key={i} className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-neutral-100 shadow-md transform hover:scale-105 transition-transform">
                        <img src={p} alt="Reference" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <div className="p-8 bg-gradient-to-r from-primary-900 to-primary-800 text-white rounded-[2.5rem] flex items-center gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
                <div className="p-5 bg-white/10 rounded-3xl shrink-0 backdrop-blur-md shadow-inner">
                  <ShieldCheck className="w-10 h-10 text-accent" />
                </div>
                <div>
                  <h4 className="font-black text-2xl tracking-tight">Serviqo Marketplace Guarantee</h4>
                  <p className="text-primary-100 text-sm mt-1 font-medium leading-relaxed max-w-lg">Your request is protected. Only verified, background-checked professionals can bid on your projects.</p>
                </div>
            </div>
          </div>
        )}

        <div className="mt-16 flex items-center justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className={`rounded-2xl px-10 gap-2 border-2 ${state.step === 1 ? 'invisible' : ''}`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>

          {state.step < 4 ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              disabled={!validateStep()}
              className="rounded-2xl px-12 gap-2 shadow-2xl shadow-primary/20 group font-black"
            >
              Next Step
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="xl"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="rounded-[2rem] px-16 gap-3 shadow-2xl shadow-primary/30 group scale-105 hover:scale-110 active:scale-95 transition-all font-black text-xl"
            >
              Post My Job Now
              {!isSubmitting && <Sparkles className="w-6 h-6 animate-pulse text-accent" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
