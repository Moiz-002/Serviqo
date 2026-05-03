'use client';

import React from 'react';
import { CheckCircle2, Sparkles, ArrowRight, LayoutDashboard, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function JobSuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8 inline-block">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <div className="absolute -top-2 -right-2 p-2 bg-white rounded-xl shadow-lg animate-bounce">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">Job Posted Successfully!</h1>
        <p className="text-neutral-500 mb-10 leading-relaxed">
          Your service request is now live. We&apos;ve notified matching professionals in your area. Expect proposals within minutes!
        </p>

        <div className="space-y-4">
          <Link 
            href="/job/my-jobs" 
            className="flex items-center justify-center gap-2 w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 group"
          >
            <Briefcase className="w-5 h-5" />
            View My Job Request
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-neutral-600 border border-neutral-200 rounded-2xl font-bold hover:bg-neutral-50 transition-all"
          >
            <LayoutDashboard className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-12 p-6 bg-primary-50 rounded-3xl border border-primary-100 text-left">
          <h4 className="font-bold text-primary-900 text-sm mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            What happens next?
          </h4>
          <ul className="space-y-3 text-xs text-primary-700 font-medium">
            <li className="flex gap-2">
              <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-primary-600">1</span>
              Professionals review your job details and reference images.
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-primary-600">2</span>
              You&apos;ll receive bids with pricing and estimated completion time.
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-primary-600">3</span>
              Chat with them, check their ratings, and hire the best fit!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
