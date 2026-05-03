'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { DAYS_OF_WEEK, HOURS, DUMMY_WORKER, RESPONSE_TIMES } from '@/config/worker-constants';

export default function WorkerAvailabilityPage() {
  const [workingDays, setWorkingDays] = useState(DUMMY_WORKER.workingDays);
  const [startTime, setStartTime] = useState(DUMMY_WORKER.startTime);
  const [endTime, setEndTime] = useState(DUMMY_WORKER.endTime);
  const [instantBooking, setInstantBooking] = useState(DUMMY_WORKER.instantBooking);
  const [responseTime, setResponseTime] = useState(DUMMY_WORKER.responseTime);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleDay = (day) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

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
          <h1 className="text-2xl font-bold text-neutral-900">Availability & Schedule</h1>
          <p className="text-neutral-500 mt-1">Set your working hours and response preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 shadow-md shadow-primary-500/20 transition-all"
        >
          {isSaving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Availability updated successfully!
        </div>
      )}

      <div className="space-y-8">
        {/* Working Days */}
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Working Days
          </h3>
          <div className="flex flex-wrap gap-3">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${
                  workingDays.includes(day)
                    ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
                    : 'border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200'
                }`}
              >
                <span className="text-xs font-bold uppercase">{day}</span>
                {workingDays.includes(day) && (
                  <CheckCircle2 className="w-3 h-3 mt-1" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-4 italic">
            * Selected days indicate when you are open to receiving new job requests.
          </p>
        </section>

        {/* Working Hours */}
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            Working Hours
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Starts At</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
              >
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Ends At</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
              >
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Booking Preferences */}
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Booking Preferences</h3>
          
          <div className="space-y-8">
            <div className="flex items-start justify-between p-6 bg-accent-50/50 border border-accent-100 rounded-2xl">
              <div className="flex gap-4">
                <div className="p-3 bg-accent-100 text-accent-700 rounded-xl shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Instant Booking</h4>
                  <p className="text-sm text-neutral-600 mt-1 leading-relaxed max-w-md">
                    Allow customers to book your services immediately without manual approval. 
                    This can increase your booking rate by up to 60%.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setInstantBooking(!instantBooking)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  instantBooking ? 'bg-accent-600' : 'bg-neutral-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  instantBooking ? 'translate-x-7' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-4">Typical Response Time</label>
              <div className="flex flex-wrap gap-3">
                {RESPONSE_TIMES.map((time) => (
                  <button
                    key={time}
                    onClick={() => setResponseTime(time)}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      responseTime === time
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Holidays Notice */}
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-bold">Planning a vacation?</p>
            <p className="mt-1">You can temporarily pause your profile from the settings page if you are unavailable for a long period.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
