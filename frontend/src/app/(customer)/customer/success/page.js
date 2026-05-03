'use client';

import React from 'react';
import { CheckCircle2, Sparkles, ArrowRight, LayoutDashboard, Briefcase } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function JobSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-10 inline-block">
          <div className="w-32 h-32 bg-success-light rounded-full flex items-center justify-center animate-scale-in shadow-inner">
            <CheckCircle2 className="w-16 h-16 text-success" strokeWidth={2.5} />
          </div>
          <div className="absolute -top-4 -right-4 p-3 bg-white rounded-[1.5rem] shadow-2xl animate-bounce border-2 border-primary-subtle">
            <Sparkles className="w-8 h-8 text-warning" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-text-primary mb-6 tracking-tight">Job Posted Successfully!</h1>
        <p className="text-text-secondary mb-12 leading-relaxed font-medium text-lg italic">
          Your service request is now live in the marketplace. We&apos;ve alerted the top-rated pros in your area!
        </p>

        <div className="space-y-4">
          <Link href="/customer/my-jobs" className="block w-full group">
            <Button variant="primary" size="xl" className="w-full rounded-[2rem] gap-3 shadow-2xl shadow-primary/30 group-hover:scale-105 transition-all font-black">
              <Briefcase className="w-6 h-6" />
              Manage My Job Request
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
          
          <Link href="/customer/dashboard" className="block w-full">
            <Button variant="outline" size="lg" className="w-full rounded-2xl border-2 font-black gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-16 p-8 bg-primary-subtle rounded-[2.5rem] border border-primary/10 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <Sparkles className="w-20 h-24 text-primary" />
          </div>
          <h4 className="font-black text-primary text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            🚀 What happens next?
          </h4>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-md text-primary font-black text-xs">1</span>
              <p className="text-xs text-text-secondary font-bold leading-relaxed">Top-rated professionals will review your details and reference images.</p>
            </li>
            <li className="flex gap-4">
              <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-md text-primary font-black text-xs">2</span>
              <p className="text-xs text-text-secondary font-bold leading-relaxed">You&apos;ll receive competitive bids with clear pricing and timelines.</p>
            </li>
            <li className="flex gap-4">
              <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-md text-primary font-black text-xs">3</span>
              <p className="text-xs text-text-secondary font-bold leading-relaxed">Chat directly with pros, compare portfolios, and hire when ready!</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
