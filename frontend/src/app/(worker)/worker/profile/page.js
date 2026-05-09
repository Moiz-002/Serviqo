'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, User, MapPin, Briefcase, Phone, Mail } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import { CITIES } from '@/config/worker-constants';
import * as api from '@/lib/api';

export default function WorkerProfilePage() {
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    city: '',
    area: '',
    yearsExperience: '1',
    phone: '',
    email: '',
    avatar: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarFileRef = useRef(null);

  useEffect(() => {
    api.getMe().then((data) => {
      const u = data.user || data;
      setFormData({
        displayName: u.name || '',
        bio: u.bio || '',
        city: u.city || '',
        area: u.address || '',
        yearsExperience: String(u.yearsExperience || u.experience || '1'),
        phone: u.phone || '',
        email: u.email || '',
        avatar: u.profilePicture || '',
      });
    }).catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      avatarFileRef.current = file;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const fd = new FormData();
      fd.append('name', formData.displayName);
      fd.append('bio', formData.bio);
      fd.append('city', formData.city);
      fd.append('address', formData.area);
      fd.append('experience', formData.yearsExperience);
      if (avatarFileRef.current) fd.append('profilePicture', avatarFileRef.current);
      await api.updateWorkerProfile(fd);
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
          <h1 className="text-2xl font-bold text-neutral-900">Personal Profile</h1>
          <p className="text-neutral-500 mt-1">Manage your public information and contact details.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 disabled:bg-primary-300 transition-all shadow-md shadow-primary-500/20"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
            <Save className="w-3 h-3" />
          </div>
          Profile updated successfully!
        </div>
      )}
      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">{saveError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Photo Upload */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm text-center">
            <h3 className="text-sm font-bold text-neutral-900 mb-4">Profile Photo</h3>
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <img
                src={avatarPreview || formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || 'W')}&background=1E3A8A&color=fff`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-neutral-50"
              />
              <button
                type="button"
                onClick={() => document.getElementById('worker-avatar-upload').click()}
                className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full border-4 border-white hover:bg-primary-600 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input id="worker-avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed px-4">
              Clear, professional photos help you build trust with customers.
            </p>
          </div>
        </div>

        {/* Right: Form Fields */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Full Name" htmlFor="displayName">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                  />
                </div>
              </FormField>

              <FormField label="Years of Experience" htmlFor="yearsExperience">
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <select
                    id="yearsExperience"
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none appearance-none"
                  >
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="5">5 Years</option>
                    <option value="8">8 Years</option>
                    <option value="10">10+ Years</option>
                  </select>
                </div>
              </FormField>
            </div>

            <FormField label="Professional Bio" htmlFor="bio" hint="Tell customers about your expertise and work ethic.">
              <textarea
                id="bio"
                name="bio"
                rows={5}
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none resize-none"
              ></textarea>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
              <FormField label="City" htmlFor="city">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none appearance-none"
                  >
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </FormField>

              <FormField label="Area / Neighborhood" htmlFor="area">
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="e.g. DHA, Gulberg"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                />
              </FormField>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-neutral-900">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Phone Number" htmlFor="phone">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-500 cursor-not-allowed outline-none"
                  />
                </div>
              </FormField>

              <FormField label="Email Address" htmlFor="email">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                  />
                </div>
              </FormField>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
