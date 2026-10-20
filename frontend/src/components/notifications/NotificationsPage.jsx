'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Briefcase, CheckCheck, MessageSquare, ShieldCheck } from 'lucide-react';
import * as api from '@/lib/api';
import { InlineLoadError, PageDataSkeleton } from '@/components/ui/LoadingStates';
import { getRealtimeSocket } from '@/lib/realtime';

const FILTERS = ['all', 'unread', 'read'];

function getNotificationIcon(type) {
  if (type === 'new_message') return MessageSquare;
  if (type?.startsWith('bid_') || type?.startsWith('job_')) return Briefcase;
  if (type === 'worker_verification') return ShieldCheck;
  return Bell;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function NotificationsPage({ role }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [loadingNotificationId, setLoadingNotificationId] = useState('');
  const [loadError, setLoadError] = useState('');

  const refreshNotifications = useCallback(async () => {
    setLoadError('');
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount ?? (data.notifications || []).filter((item) => !item.read).length);
    } catch (error) {
      setLoadError(error.message || 'Unable to load notifications.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.getNotifications()
      .then((data) => {
        if (cancelled) return;
        const items = data.notifications || [];
        setNotifications(items);
        setUnreadCount(data.unreadCount ?? items.filter((item) => !item.read).length);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message || 'Unable to load notifications.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    const socket = getRealtimeSocket();
    const onNotification = (notification) => {
      setNotifications((current) => {
        if (current.some((item) => String(item._id) === String(notification._id))) return current;
        return [notification, ...current].slice(0, 30);
      });
      if (!notification.read) setUnreadCount((count) => count + 1);
    };
    const onNotificationsUpdated = () => { refreshNotifications(); };
    socket.on('notification:created', onNotification);
    window.addEventListener('serviqo:notifications-updated', onNotificationsUpdated);
    return () => {
      cancelled = true;
      socket.off('notification:created', onNotification);
      window.removeEventListener('serviqo:notifications-updated', onNotificationsUpdated);
    };
  }, [refreshNotifications]);

  const visibleNotifications = useMemo(() => notifications.filter((notification) => (
    filter === 'all' || (filter === 'unread' ? !notification.read : notification.read)
  )), [filter, notifications]);

  const markOneRead = async (notification) => {
    if (notification.read || !notification._id) {
      router.push(notification.href || `/${role}/dashboard`);
      return;
    }
    setLoadingNotificationId(String(notification._id));
    setLoadError('');
    try {
      const { notification: updated } = await api.markNotificationRead(notification._id);
      setNotifications((current) => current.map((item) => (
        String(item._id) === String(updated._id) ? updated : item
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
      window.dispatchEvent(new Event('serviqo:notifications-updated'));
      router.push(notification.href || `/${role}/dashboard`);
    } catch (error) {
      setLoadError(error.message || 'Unable to update this notification.');
    } finally {
      setLoadingNotificationId('');
    }
  };

  const clearAll = async () => {
    if (unreadCount === 0 || isClearing) return;
    setIsClearing(true);
    setLoadError('');
    try {
      await api.markNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event('serviqo:notifications-updated'));
    } catch (error) {
      setLoadError(error.message || 'Unable to clear unread notifications.');
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) return <PageDataSkeleton label="Loading notifications" rows={5} />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {loadError && (
        <InlineLoadError message={loadError} onRetry={refreshNotifications} />
      )}

      <header className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary-subtle p-3 text-primary">
            <Bell className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 sm:text-3xl">Notifications</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'You are up to date.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={clearAll}
          disabled={unreadCount === 0 || isClearing}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700 transition-colors hover:border-primary/30 hover:bg-primary-subtle hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" aria-hidden="true" />
          {isClearing ? 'Clearing…' : 'Clear All'}
        </button>
      </header>

      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 p-4 sm:px-6">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
              className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition-colors ${
                filter === item
                  ? 'bg-primary text-white'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
              }`}
            >
              {item}
              {item === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
            </button>
          ))}
        </div>

        {visibleNotifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <Bell className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-bold text-neutral-800">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Updates about messages, bids, and your account will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {visibleNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const isBusy = loadingNotificationId === String(notification._id);
              return (
                <li key={notification._id} className={notification.read ? 'bg-white' : 'bg-primary-subtle/50'}>
                  <Link
                    href={notification.href || `/${role}/dashboard`}
                    aria-disabled={isBusy}
                    onClick={(event) => {
                      if (isBusy) {
                        event.preventDefault();
                        return;
                      }
                      if (!notification.read) {
                        event.preventDefault();
                        markOneRead(notification);
                      }
                    }}
                    className="flex items-start gap-4 px-5 py-5 transition-colors hover:bg-neutral-50 sm:px-6"
                  >
                    <span className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      notification.read ? 'bg-neutral-100 text-neutral-500' : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm ${notification.read ? 'font-semibold text-neutral-700' : 'font-black text-neutral-900'}`}>
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                            Unread
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-neutral-600">{notification.message}</span>
                      <span className="mt-2 block text-xs font-medium text-neutral-400">{formatDate(notification.createdAt)}</span>
                    </span>
                    {isBusy && <span className="mt-3 h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {notifications.length >= 30 && (
          <p className="border-t border-neutral-100 px-5 py-3 text-center text-xs text-neutral-400">
            Showing your 30 most recent notifications.
          </p>
        )}
      </section>
    </div>
  );
}
