'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { DAYS_OF_WEEK, HOURS, RESPONSE_TIMES } from '@/config/worker-constants';
import * as api from '@/lib/api';

const DAY_MAP = {
  Mon: 'monday', Tue: 'tuesday', Wed: 'wednesday', Thu: 'thursday',
  Fri: 'friday', Sat: 'saturday', Sun: 'sunday',
};
const DAY_MAP_REVERSE = Object.fromEntries(Object.entries(DAY_MAP).map(([k, v]) => [v, k]));

export default function WorkerAvailabilityPage() {
  const [workingDays, setWorkingDays] = useState([]);
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('06:00 PM');
  const [instantBooking, setInstantBooking] = useState(false);
  const [responseTime, setResponseTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    api.getMe().then((data) => {
      const u = data.user || data;
      if (u.availability) {
        const days = Object.entries(u.availability)
          .filter(([, v]) => v?.available)
          .map(([k]) => DAY_MAP_REVERSE[k])
          .filter(Boolean);
        setWorkingDays(days);
        const firstDay = Object.values(u.availability).find((v) => v?.available);
        if (firstDay?.from) setStartTime(firstDay.from);
        if (firstDay?.to) setEndTime(firstDay.to);
      }
      if (u.responseTime) setResponseTime(u.responseTime);
    }).catch(() => {});
  }, []);

  const toggleDay = (day) => {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const availability = {};
      DAYS_OF_WEEK.forEach((day) => {
        const fullDay = DAY_MAP[day];
        availability[fullDay] = {
          available: workingDays.includes(day),
          from: startTime,
          to: endTime,
        };
      });
      await api.updateAvailability({ availability, responseTime });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
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
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-600 shadow-md shadow-primary-500/20 transition-all"
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
      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">{saveError}</div>
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
                        ? 'bg-primary text-white shadow-md'
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
