'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Briefcase, CheckCircle2, Info, MessageSquare, ShieldCheck, X, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRealtimeSocket } from '@/lib/realtime';
import * as api from '@/lib/api';
import { SkeletonBlock } from '@/components/ui/LoadingStates';

function getNotificationPresentation(notification) {
  const isVerified = notification.type === 'worker_verification';
  const approved = isVerified && notification.title?.toLowerCase().includes('approved');
  return {
    icon: notification.type === 'new_message'
      ? MessageSquare
      : notification.type?.startsWith('bid_') || notification.type?.startsWith('job_')
        ? Briefcase
        : isVerified
          ? (approved ? CheckCircle2 : XCircle)
          : notification.type === 'worker_verification'
            ? ShieldCheck
            : Info,
    tone: approved ? 'text-success' : isVerified ? 'text-error' : 'text-primary',
  };
}

export default function NotificationCenter({ role }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [removingId, setRemovingId] = useState('');
  const [actionError, setActionError] = useState('');
  const containerRef = useRef(null);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      const saved = data.notifications || [];
      setNotifications(saved.map((notification) => ({
        ...notification,
        id: notification._id,
        text: notification.message,
        href: notification.href || `/${role}/dashboard`,
        ...getNotificationPresentation(notification),
      })));
      setUnreadCount(data.unreadCount ?? saved.filter((notification) => !notification.read).length);
    } catch (error) {
      console.error('Unable to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    let cancelled = false;
    api.getNotifications()
      .then((data) => {
        if (cancelled) return;
        const saved = data.notifications || [];
        setNotifications(saved.map((notification) => ({
          ...notification,
          id: notification._id,
          text: notification.message,
          href: notification.href || `/${role}/dashboard`,
          ...getNotificationPresentation(notification),
        })));
        setUnreadCount(data.unreadCount ?? saved.filter((notification) => !notification.read).length);
      })
      .catch((error) => {
        if (!cancelled) console.error('Unable to load notifications:', error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    const socket = getRealtimeSocket();
    const handlers = ['message:created', 'bid:created', 'bid:decision', 'job:status', 'notification:created'].map((event) => {
      const handler = (payload) => {
        if (event === 'message:created' && payload.conversationId && payload.message?._id) {
          socket.emit('message:delivered', {
            conversationId: payload.conversationId,
            messageIds: [payload.message._id],
          });
        }
        refreshNotifications();
      };
      socket.on(event, handler);
      return { event, handler };
    });
    const onNotificationsUpdated = () => { refreshNotifications(); };
    window.addEventListener('serviqo:notifications-updated', onNotificationsUpdated);
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => {
      cancelled = true;
      handlers.forEach(({ event, handler }) => socket.off(event, handler));
      window.removeEventListener('serviqo:notifications-updated', onNotificationsUpdated);
      document.removeEventListener('mousedown', closeOnOutsideClick);
    };
  }, [refreshNotifications, role]);

  const markAllRead = async () => {
    try {
      setActionError('');
      await api.markNotificationsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event('serviqo:notifications-updated'));
    } catch (error) {
      setActionError(error.message || 'Unable to clear notifications.');
    }
  };

  const removeNotification = async (event, notification) => {
    event.preventDefault();
    event.stopPropagation();
    if (!notification._id || removingId) return;

    setRemovingId(String(notification._id));
    setActionError('');
    try {
      await api.deleteNotification(notification._id);
      setNotifications((current) => current.filter((item) => item.id !== notification.id));
      if (!notification.read) setUnreadCount((count) => Math.max(0, count - 1));
      window.dispatchEvent(new Event('serviqo:notifications-updated'));
    } catch (error) {
      setActionError(error.message || 'Unable to remove this notification.');
    } finally {
      setRemovingId('');
    }
  };

  const openNotification = async (event, notification) => {
    setIsOpen(false);
    if (notification.read || !notification._id) return;
    event.preventDefault();
    try {
      const { notification: updated } = await api.markNotificationRead(notification._id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, ...updated, ...getNotificationPresentation(updated) } : item
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
      window.dispatchEvent(new Event('serviqo:notifications-updated'));
    } catch (error) {
      console.error('Unable to mark notification as read:', error);
    } finally {
      router.push(notification.href);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="relative rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/10"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-error px-0.5 text-[9px] font-black text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
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
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-bold text-primary hover:underline">
                Clear all
              </button>
            )}
          </div>
          {actionError && (
            <p role="alert" className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs font-medium text-red-700">
              {actionError}
            </p>
          )}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-4 px-4 py-5" role="status" aria-label="Loading notifications">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="flex gap-3">
                    <SkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <SkeletonBlock className="h-4 w-2/3" />
                      <SkeletonBlock className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                <p className="text-sm font-bold text-text-secondary">You&apos;re all caught up</p>
                <p className="mt-1 text-xs text-text-tertiary">New bids, messages, and job updates will appear here.</p>
              </div>
            ) : notifications.slice(0, 3).map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 border-b border-neutral-100 px-4 py-3 ${notification.read ? '' : 'bg-primary-subtle/50'}`}
                >
                  <Link
                    href={notification.href}
                    onClick={(event) => openNotification(event, notification)}
                    className="flex min-w-0 flex-1 gap-3 rounded-lg transition-colors hover:bg-neutral-50"
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${notification.tone}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-black text-text-primary">{notification.title}</span>
                      <span className="mt-0.5 block text-xs font-medium text-text-secondary">{notification.text}</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => removeNotification(event, notification)}
                    disabled={removingId === String(notification._id)}
                    aria-label={`Remove notification: ${notification.title}`}
                    title="Remove notification"
                    className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {removingId === String(notification._id)
                      ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary" />
                      : <X className="h-4 w-4" />}
                  </button>
                </div>
              );
            })}
          </div>
          <Link
            href={`/${role}/notifications`}
            onClick={() => setIsOpen(false)}
            className="block border-t border-neutral-100 px-4 py-3 text-center text-xs font-black text-primary hover:bg-neutral-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
