'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Calendar,
  User,
  MapPin,
  X
} from 'lucide-react';
import * as api from '@/lib/api';

export default function WorkerVerificationPage() {
  const [verifications, setVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [documentViewer, setDocumentViewer] = useState(null);

  useEffect(() => {
    api.getPendingVerifications()
      .then((data) => setVerifications(data.verifications || data.workers || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const closeWithEscape = (event) => {
      if (event.key === 'Escape') {
        setDocumentViewer(null);
        setSelectedVerification(null);
      }
    };
    document.addEventListener('keydown', closeWithEscape);
    return () => document.removeEventListener('keydown', closeWithEscape);
  }, []);

  const handleApprove = async () => {
    if (!selectedVerification || actionLoading) return;
    setActionLoading(true);
    try {
      await api.approveVerification(selectedVerification._id);
      setVerifications((prev) => prev.filter((v) => v._id !== selectedVerification._id));
      setSelectedVerification(null);
    } catch {}
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!selectedVerification || actionLoading) return;
    if (rejectReason.trim().length < 10) return;
    setActionLoading(true);
    try {
      await api.rejectVerification(selectedVerification._id, { reason: rejectReason.trim() });
      setVerifications((prev) => prev.filter((v) => v._id !== selectedVerification._id));
      setSelectedVerification(null);
      setRejectReason('');
    } catch {}
    setActionLoading(false);
  };

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
                {verifications.length} PENDING
              </span>
            </div>
            <div className="divide-y divide-neutral-100">
              {verifications.length === 0 ? (
                <div className="p-12 text-center text-neutral-400">No pending verifications.</div>
              ) : verifications.map((verification) => (
                <div
                  key={verification._id}
                  className={`p-6 hover:bg-neutral-50 transition-all cursor-pointer group ${
                    selectedVerification?._id === verification._id ? 'bg-primary-50/30' : ''
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
                          {verification.name}
                        </h3>
                        <p className="text-xs text-neutral-500">{verification.serviceCategory || verification.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-neutral-400">Submitted on</p>
                      <p className="text-xs font-bold text-neutral-900">
                        {verification.createdAt ? new Date(verification.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    {[verification.cnicFront, verification.cnicBack].filter(Boolean).length > 0 ? (
                      <div className="flex -space-x-2">
                        {[verification.cnicFront, verification.cnicBack].filter(Boolean).map((img, i) => (
                          <div key={i} className="w-8 h-8 rounded-lg border-2 border-white bg-neutral-100 overflow-hidden">
                            <img src={api.getImageUrl(img)} alt={`CNIC ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">No documents yet</span>
                    )}
                    {[verification.cnicFront, verification.cnicBack].filter(Boolean).length > 0 && (
                      <span className="text-xs text-neutral-400">{[verification.cnicFront, verification.cnicBack].filter(Boolean).length} Document(s)</span>
                    )}
                    <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedVerification(verification); }} aria-label={`Review documents for ${verification.name}`} className="ml-auto p-2 bg-white border border-neutral-200 rounded-xl text-neutral-400 group-hover:text-primary-600 group-hover:border-primary-200 transition-all">
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
            <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm p-4 sm:p-6 space-y-6 sticky top-24">
              <div className="flex justify-end">
                <button type="button" onClick={() => setSelectedVerification(null)} aria-label="Close verification details" className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-secondary-50 flex items-center justify-center text-secondary-600 mx-auto border-4 border-secondary-100">
                  {selectedVerification.profilePicture ? (
                    <img src={api.getImageUrl(selectedVerification.profilePicture)} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User className="w-10 h-10" />
                  )}
                </div>
                <h2 className="mt-4 text-xl font-bold text-neutral-900">{selectedVerification.name}</h2>
                <p className="text-sm text-neutral-500">{selectedVerification.serviceCategory || selectedVerification.phone}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-400">Application Date</p>
                    <p className="text-sm font-bold text-neutral-900">
                      {selectedVerification.createdAt ? new Date(selectedVerification.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-400">Worker ID</p>
                    <p className="text-sm font-bold text-neutral-900">{String(selectedVerification._id).slice(-8)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Documents</p>
                {[selectedVerification.cnicFront, selectedVerification.cnicBack].filter(Boolean).length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[selectedVerification.cnicFront, selectedVerification.cnicBack].filter(Boolean).map((img, i) => (
                      <div key={i} className="aspect-[3/2] rounded-2xl bg-neutral-100 border border-neutral-200 overflow-hidden relative group cursor-zoom-in">
                        <button type="button" onClick={() => setDocumentViewer({ src: img, label: `CNIC ${i === 0 ? 'front' : 'back'}` })} className="h-full w-full">
                          <img src={api.getImageUrl(img)} alt={`Document ${i + 1}`} className="w-full h-full object-contain bg-neutral-100" />
                        </button>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 text-center py-4">No documents uploaded yet</p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <label htmlFor="rejection-reason" className="text-sm font-bold text-neutral-700">Note for worker when rejecting</label>
                <textarea id="rejection-reason" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} rows={3} placeholder="Example: Upload a clear CNIC back image." className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full py-3.5 bg-accent text-navy-900 font-bold rounded-2xl hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {actionLoading ? 'Processing…' : 'Approve Worker'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || rejectReason.trim().length < 10}
                  className="w-full py-3.5 bg-white border border-error text-error font-bold rounded-2xl hover:bg-error-light transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Application
                </button>
              </div>
              {documentViewer && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-navy-950/85 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`${documentViewer.label} document`} onMouseDown={(event) => { if (event.target === event.currentTarget) setDocumentViewer(null); }}>
                  <div className="relative flex max-h-[94vh] max-w-5xl items-center justify-center rounded-2xl bg-white p-2 shadow-2xl sm:p-4">
                    <button type="button" onClick={() => setDocumentViewer(null)} aria-label="Close document preview" className="absolute right-3 top-3 z-10 rounded-full bg-navy-950 p-2.5 text-white shadow-lg transition hover:bg-primary focus:outline-none focus:ring-4 focus:ring-cyan-300">
                      <X className="h-5 w-5" />
                    </button>
                    <img src={api.getImageUrl(documentViewer.src)} alt={documentViewer.label} className="max-h-[88vh] max-w-[calc(100vw-2rem)] rounded-xl object-contain sm:max-w-[85vw]" />
                  </div>
                </div>
              )}
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
