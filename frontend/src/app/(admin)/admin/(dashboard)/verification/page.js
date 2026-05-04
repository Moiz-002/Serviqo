'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Eye,
  FileText,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import { DUMMY_VERIFICATIONS } from '@/config/admin-constants';

export default function WorkerVerificationPage() {
  const [selectedVerification, setSelectedVerification] = useState(null);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Worker Verification</h1>
        <p className="text-neutral-500 mt-2">Review and approve worker identification documents and skills.</p>
      </div>

      {/* Verification Queue */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Pending Requests</h2>
              <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-bold rounded-full">
                {DUMMY_VERIFICATIONS.length} PENDING
              </span>
            </div>
            <div className="divide-y divide-neutral-100">
              {DUMMY_VERIFICATIONS.map((verification) => (
                <div 
                  key={verification.id}
                  className={`p-6 hover:bg-neutral-50 transition-all cursor-pointer group ${
                    selectedVerification?.id === verification.id ? 'bg-primary-50/30' : ''
                  }`}
                  onClick={() => setSelectedVerification(verification)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-600">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                          {verification.workerName}
                        </h3>
                        <p className="text-xs text-neutral-500">{verification.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-neutral-400">Submitted on</p>
                      <p className="text-xs font-bold text-neutral-900">{verification.submittedAt}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-lg border-2 border-white bg-neutral-100 overflow-hidden">
                        <img src={verification.cnicFront} alt="CNIC Front" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-8 h-8 rounded-lg border-2 border-white bg-neutral-100 overflow-hidden">
                        <img src={verification.cnicBack} alt="CNIC Back" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">2 Documents attached</span>
                    <button className="ml-auto p-2 bg-white border border-neutral-200 rounded-xl text-neutral-400 group-hover:text-primary-600 group-hover:border-primary-200 transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed View Panel */}
        <div className="xl:col-span-1">
          {selectedVerification ? (
            <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm p-6 space-y-6 sticky top-24">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-secondary-50 flex items-center justify-center text-secondary-600 mx-auto border-4 border-secondary-100">
                  <User className="w-10 h-10" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-neutral-900">{selectedVerification.workerName}</h2>
                <p className="text-sm text-neutral-500">{selectedVerification.category}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-400">Application Date</p>
                    <p className="text-sm font-bold text-neutral-900">{selectedVerification.submittedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-400">Verification ID</p>
                    <p className="text-sm font-bold text-neutral-900">{selectedVerification.id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Documents</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-[3/2] rounded-2xl bg-neutral-100 border border-neutral-200 overflow-hidden relative group cursor-zoom-in">
                    <img src={selectedVerification.cnicFront} alt="CNIC Front" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="aspect-[3/2] rounded-2xl bg-neutral-100 border border-neutral-200 overflow-hidden relative group cursor-zoom-in">
                    <img src={selectedVerification.cnicBack} alt="CNIC Back" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <button className="w-full py-3.5 bg-accent text-navy-900 font-bold rounded-2xl hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Approve Worker
                </button>
                <button className="w-full py-3.5 bg-white border border-error text-error font-bold rounded-2xl hover:bg-error-light transition-colors flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Reject Application
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-[32px] border-2 border-dashed border-neutral-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <p className="text-neutral-500 font-medium">Select an application from the queue to review details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
