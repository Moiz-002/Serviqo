'use client';

import React, { useState } from 'react';
import { Wrench, CheckCircle2, Plus, X, Info, Save } from 'lucide-react';
import { CATEGORIES, DUMMY_WORKER } from '@/config/worker-constants';
import TagInput from '@/components/ui/TagInput';

export default function WorkerSkillsPage() {
  const [primaryCategory, setPrimaryCategory] = useState(DUMMY_WORKER.primaryCategory);
  const [skills, setSkills] = useState(DUMMY_WORKER.skills);
  const [hourlyRate, setHourlyRate] = useState(DUMMY_WORKER.hourlyRate);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedCategoryData = CATEGORIES.find(c => c.id === primaryCategory);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Skills & Specializations</h1>
          <p className="text-neutral-500 mt-1">Manage your service categories and technical skills.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 shadow-md shadow-primary-500/20 transition-all"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Skills and rates updated successfully!
        </div>
      )}

      <div className="space-y-8">
        {/* Category Selection */}
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary-500" />
            Primary Service Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setPrimaryCategory(cat.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 relative ${
                  primaryCategory === cat.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-100 bg-white hover:border-primary-200 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{cat.icon}</span>
                  {primaryCategory === cat.id && (
                    <CheckCircle2 className="w-5 h-5 text-accent-600" />
                  )}
                </div>
                <h4 className="font-bold text-neutral-900">{cat.name}</h4>
                <p className="text-xs text-neutral-500 mt-1">{cat.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Specific Skills */}
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-900">Technical Skills</h3>
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
              {skills.length} Skills Added
            </span>
          </div>
          
          <div className="mb-6 p-4 bg-primary-50/50 border border-primary-100 rounded-xl flex gap-3">
            <Info className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
            <p className="text-sm text-neutral-600 leading-relaxed">
              Adding more specific skills helps our AI match you with higher-paying, relevant jobs. 
              Be specific (e.g., &quot;Inverter Repair&quot; instead of just &quot;Repair&quot;).
            </p>
          </div>

          <TagInput
            value={skills}
            onChange={setSkills}
            suggestions={selectedCategoryData?.skills || []}
            placeholder="Type a skill and press enter..."
          />
        </section>

        {/* Hourly Rate */}
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Pricing & Rates</h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Your Hourly Rate (PKR)</label>
            <div className="flex gap-3">
              <div className="flex-1 flex items-center px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
                <span className="text-neutral-500 font-bold mr-2 text-sm">PKR</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full py-3 bg-transparent text-neutral-900 font-semibold outline-none"
                />
                <span className="text-neutral-400 text-sm ml-2">/ hr</span>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              Market average for {selectedCategoryData?.name} in {DUMMY_WORKER.city}: 
              <span className="font-bold text-neutral-700 ml-1">1,200 - 3,500 PKR</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
