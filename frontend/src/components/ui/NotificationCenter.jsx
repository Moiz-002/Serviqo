'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, Info, MessageSquare, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getRealtimeSocket } from '@/lib/realtime';
import * as api from '@/lib/api';

const eventToNotification = (event, payload, role) => {
  if (event === 'message:created') {
    return {
      icon: MessageSquare,
      title: 'New message',
      text: payload.message?.text || 'You received a new message.',
      href: `/${role}/messages?conversation=${encodeURIComponent(payload.conversationId)}`,
      tone: 'text-primary',
    };
  }
  if (event === 'bid:created') {
    return {
      icon: Info,
      title: 'New bid received',
      text: `${payload.totalBids} bid${payload.totalBids === 1 ? '' : 's'} on your job.`,
      href: `/customer/job/${payload.jobId}`,
      tone: 'text-primary',
    };
  }
  if (event === 'bid:decision') {
    const accepted = payload.status === 'accepted';
    return {
      icon: accepted ? CheckCircle2 : XCircle,
      title: accepted ? 'Bid accepted' : 'Bid declined',
      text: accepted ? 'You have been hired for this job.' : 'Your bid was not selected.',
      href: role === 'worker' ? '/worker/dashboard' : '/customer/my-jobs',
      tone: accepted ? 'text-success' : 'text-error',
    };
  }
  if (event === 'worker:verification') {
    const approved = payload.status === 'approved';
    return {
      icon: approved ? CheckCircle2 : XCircle,
      title: approved ? 'Verification approved' : 'Verification needs changes',
      text: approved ? 'You can now submit bids.' : (payload.reason || 'Please update your documents.'),
      href: '/worker/dashboard',
      tone: approved ? 'text-success' : 'text-error',
    };
  }
  return {
    icon: Info,
    title: 'Job update',
    text: `Your job is now ${String(payload.status || '').replace('_', ' ')}.`,
    href: '/worker/dashboard',
    tone: 'text-primary',
  };
};

export default function NotificationCenter({ role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    api.getNotifications().then(({ notifications: saved = [] }) => {
      setNotifications(saved.map((notification) => ({
        ...notification,
        id: notification._id,
        title: notification.title,
        text: notification.message,
        href: notification.href || `/${role}/dashboard`,
        icon: notification.type === 'worker_verification' && notification.title.includes('approved') ? CheckCircle2 : notification.type === 'worker_verification' ? XCircle : Info,
        tone: notification.type === 'worker_verification' && notification.title.includes('approved') ? 'text-success' : notification.type === 'worker_verification' ? 'text-error' : 'text-primary',
      })));
    }).catch(() => {});
    const socket = getRealtimeSocket();
    const handlers = ['message:created', 'bid:created', 'bid:decision', 'job:status', 'notification:created'].map((event) => {
      const handler = (payload) => {
        if (event === 'notification:created') {
          setNotifications((current) => [
            { ...payload, id: payload._id || `${Date.now()}-${Math.random()}`, text: payload.message, href: payload.href || `/${role}/dashboard`, icon: payload.title?.includes('approved') ? CheckCircle2 : payload.title?.includes('needs changes') ? XCircle : Info, tone: payload.title?.includes('approved') ? 'text-success' : payload.title?.includes('needs changes') ? 'text-error' : 'text-primary' },
            ...current,
          ].slice(0, 30));
          return;
        }
        const notification = eventToNotification(event, payload, role);
        if (event === 'bid:created' && role !== 'customer') return;
        if (event === 'bid:decision' && role !== 'worker') return;
        if (event === 'message:created' && !payload.conversationId) return;
        if (event === 'worker:verification' && role !== 'worker') return;
        setNotifications((current) => [
          { ...notification, id: `${Date.now()}-${Math.random()}` },
          ...current,
        ].slice(0, 20));
      };
      socket.on(event, handler);
      return { event, handler };
    });
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => {
      handlers.forEach(({ event, handler }) => socket.off(event, handler));
      document.removeEventListener('mousedown', closeOnOutsideClick);
    };
  }, [role]);

  const markAllRead = () => {
    setNotifications([]);
    api.markNotificationsRead().catch(() => {});
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${notifications.length ? `, ${notifications.length} unread` : ''}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="relative rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/10"
      >
        <Bell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-error px-0.5 text-[9px] font-black text-white">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-[100] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-black text-text-primary">Notifications</h2>
              <p className="text-[11px] font-medium text-text-tertiary">Live updates from Serviqo</p>
            </div>
            {notifications.length > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-bold text-primary hover:underline">
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                <p className="text-sm font-bold text-text-secondary">You&apos;re all caught up</p>
                <p className="mt-1 text-xs text-text-tertiary">New bids, messages, and job updates will appear here.</p>
              </div>
            ) : notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => setIsOpen(false)}
                  className="flex gap-3 border-b border-neutral-100 px-4 py-3 transition-colors hover:bg-neutral-50"
                >
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${notification.tone}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-text-primary">{notification.title}</span>
                    <span className="mt-0.5 block text-xs font-medium text-text-secondary">{notification.text}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
