'use client';

import React, { useState } from 'react';
import { ImageIcon, Plus, Trash2, Pencil, GripVertical, CheckCircle2, Upload } from 'lucide-react';
import FileUpload from '@/components/ui/FileUpload';
import { DUMMY_WORKER } from '@/config/worker-constants';

export default function WorkerPortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState(DUMMY_WORKER.portfolioItems);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleRemove = (id) => {
    setPortfolioItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFilesChange = (files) => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newItems = files.map((file, idx) => ({
        id: Date.now() + idx,
        preview: URL.createObjectURL(file),
        caption: 'New work photo'
      }));
      setPortfolioItems(prev => [...newItems, ...prev]);
      setIsUploading(false);
      setShowUploadModal(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Work Portfolio</h1>
          <p className="text-neutral-500 mt-1">Showcase your best projects to win more clients.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 shadow-md shadow-primary-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Project
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {portfolioItems.map((item) => (
          <div key={item.id} className="group bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="relative aspect-square">
              <img 
                src={item.preview} 
                alt={item.caption} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-colors">
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="p-2.5 bg-error/80 hover:bg-error text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-5 h-5 text-white drop-shadow-md cursor-grab active:cursor-grabbing" />
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-neutral-800 font-medium line-clamp-2">{item.caption}</p>
            </div>
          </div>
        ))}

        {/* Empty State / Add Card */}
        <button 
          onClick={() => setShowUploadModal(true)}
          className="aspect-square rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-3 text-neutral-400 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50 transition-all group"
        >
          <div className="p-4 bg-neutral-50 rounded-full group-hover:bg-primary-100 transition-colors">
            <Upload className="w-8 h-8" />
          </div>
          <span className="font-bold text-sm">Upload Photo</span>
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Add Portfolio Project</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <FileUpload 
                onFilesChange={handleFilesChange}
                accept="image/*"
                multiple
                label="Select work photos"
              />
              {isUploading && (
                <div className="mt-6 flex items-center gap-3 text-primary-600 font-medium animate-pulse">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  Uploading your work...
                </div>
              )}
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-2.5 text-neutral-600 font-bold hover:bg-neutral-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={isUploading}
                  className="px-8 py-2.5 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 shadow-lg shadow-primary-500/20 disabled:bg-neutral-300 transition-all"
                >
                  Save to Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
