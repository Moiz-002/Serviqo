'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { getRealtimeSocket } from '@/lib/realtime';

const ToastContext = createContext(null);

const styles = {
  success: { icon: CheckCircle2, className: 'border-success/30 bg-success-light text-success' },
  error: { icon: XCircle, className: 'border-error/30 bg-error-light text-error' },
  info: { icon: Info, className: 'border-primary/20 bg-primary-subtle text-primary' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const push = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current.slice(-2), { id, message, type }]);
    window.setTimeout(() => remove(id), 4500);
  }, [remove]);

  useEffect(() => {
    const socket = getRealtimeSocket();
    const onBid = () => push('A new bid has arrived on your job.', 'info');
    const onDecision = ({ status }) => push(
      status === 'accepted' ? 'Your bid was accepted. You have been hired!' : 'Your bid was declined.',
      status === 'accepted' ? 'success' : 'info',
    );
    const onMessage = () => push('You have a new message.', 'info');
    const onJob = ({ status }) => push(`Job status updated to ${status.replace('_', ' ')}.`, 'info');
    const onVerification = ({ status, reason }) => push(
      status === 'approved'
        ? 'Your worker verification was approved. You can now submit bids.'
        : `Verification update: ${reason || 'Please update your documents.'}`,
      status === 'approved' ? 'success' : 'error',
    );
    socket.on('bid:created', onBid);
    socket.on('bid:decision', onDecision);
    socket.on('message:created', onMessage);
    socket.on('job:status', onJob);
    socket.on('worker:verification', onVerification);
    return () => {
      socket.off('bid:created', onBid);
      socket.off('bid:decision', onDecision);
      socket.off('message:created', onMessage);
      socket.off('job:status', onJob);
      socket.off('worker:verification', onVerification);
    };
  }, [push]);

  const value = { push };
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const config = styles[toast.type] || styles.info;
          const Icon = config.icon;
          return (
            <div key={toast.id} role="status" className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${config.className}`}>
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm font-bold">{toast.message}</p>
              <button type="button" onClick={() => remove(toast.id)} aria-label="Dismiss notification" className="opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
