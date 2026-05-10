'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Camera,
  Save,
  CheckCircle2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Card from '@/components/ui/Card';
import FormField from '@/components/ui/FormField';
import * as api from '@/lib/api';

export default function CustomerProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarFileRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    area: '',
    profilePicture: '',
    createdAt: '',
    jobsPosted: 0,
  });

  useEffect(() => {
    api.getMe().then((data) => {
      const u = data.user || data;
      setFormData({
        fullName: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        city: u.city || '',
        area: u.address || '',
        profilePicture: u.profilePicture || '',
        createdAt: u.createdAt || '',
        jobsPosted: u.jobsPosted || 0,
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
      fd.append('name', formData.fullName);
      if (formData.city) fd.append('city', formData.city);
      if (formData.area) fd.append('address', formData.area);
      if (avatarFileRef.current) fd.append('profilePicture', avatarFileRef.current);
      await api.updateUserProfile(fd);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">My Profile</h1>
          <p className="text-neutral-500 mt-1 font-medium">Manage your personal information and preferences.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-6 py-2.5 bg-white border border-neutral-200 rounded-xl font-bold text-neutral-700 hover:bg-neutral-50 transition-all shadow-sm"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-6 py-2.5 text-neutral-500 font-bold hover:bg-neutral-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-fg rounded-xl font-black hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >

              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-bold text-sm">Profile updated successfully!</p>
        </div>
      )}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-bold text-sm">{saveError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Avatar & Status */}
        <div className="space-y-6">
          <Card className="p-8 text-center border-neutral-200/60">
            <div className="relative inline-block group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-50 shadow-inner">
                <img
                  src={avatarPreview || formData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'U')}&background=1E3A8A&color=fff`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar-upload').click()}
                    className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </>
              )}
            </div>
            <h2 className="mt-6 text-xl font-black text-neutral-900">{formData.fullName || '—'}</h2>
            <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest mt-1">Customer</p>
            
            <div className="mt-8 pt-8 border-t border-neutral-100 flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-tight">
              <Shield className="w-4 h-4" />
              Verified Account
            </div>
          </Card>

          <Card className="p-6 border-neutral-200/60 bg-primary-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
            <h4 className="font-black text-sm uppercase tracking-widest text-primary-300">Member Since</h4>
            <p className="text-navy-500 text-lg font-bold mt-1">
              {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase text-primary">Jobs Posted</p>
                <p className="text-xl font-black text-navy-500">{formData.jobsPosted}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Details Form */}
        <div className="md:col-span-2">
          <Card className="p-8 md:p-10 border-neutral-200/60 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <FormField label="Full Name">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-primary transition-all disabled:bg-neutral-50 disabled:text-neutral-500 font-bold"
                  />
                </div>
              </FormField>

              <FormField label="Email Address">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-primary transition-all disabled:bg-neutral-50 disabled:text-neutral-500 font-bold"
                  />
                </div>
              </FormField>

              <FormField label="Phone Number" hint="Verification required for changes">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    disabled
                    className="w-full pl-12 pr-4 py-3 bg-neutral-100 border border-neutral-200 rounded-2xl text-neutral-400 font-bold cursor-not-allowed"
                  />
                </div>
              </FormField>

              <FormField label="City">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-primary transition-all disabled:bg-neutral-50 disabled:text-neutral-500 font-bold appearance-none cursor-pointer"
                  >
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                  </select>
                </div>
              </FormField>

              <FormField label="Area / Neighborhood" className="sm:col-span-2">
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g. F-10/2, DHA Phase 2"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-primary transition-all disabled:bg-neutral-50 disabled:text-neutral-500 font-bold"
                />
              </FormField>
            </div>

            <div className="pt-8 border-t border-neutral-100">
              <h4 className="text-lg font-black text-neutral-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security Settings
              </h4>
              <div className="space-y-4">
                <button className="flex items-center justify-between w-full p-4 hover:bg-neutral-50 rounded-2xl transition-colors group">
                  <div className="text-left">
                    <p className="font-bold text-neutral-900">Change Password</p>
                    <p className="text-xs text-neutral-500 mt-1">Last changed 4 months ago</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" />
                </button>
                <button className="flex items-center justify-between w-full p-4 hover:bg-neutral-50 rounded-2xl transition-colors group">
                  <div className="text-left">
                    <p className="font-bold text-neutral-900">Two-Factor Authentication</p>
                    <p className="text-xs text-neutral-500 mt-1">Recommended for better security</p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">Off</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
