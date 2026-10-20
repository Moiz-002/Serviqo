'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  Wrench, 
  Calendar, 
  Star, 
  Image as ImageIcon, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquare,
  Globe,
  HelpCircle,
  ChevronRight,
  Search
} from 'lucide-react';
import * as api from '@/lib/api';
import NotificationCenter from '@/components/ui/NotificationCenter';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/worker/dashboard' },
  { icon: User, label: 'My Profile', href: '/worker/profile' },
  { icon: Wrench, label: 'Skills & Services', href: '/worker/skills' },
  { icon: ImageIcon, label: 'Portfolio', href: '/worker/portfolio' },
  { icon: Calendar, label: 'Availability', href: '/worker/availability' },
  { icon: Star, label: 'Reviews', href: '/worker/reviews' },
  { icon: MessageSquare, label: 'Messages', href: '/worker/messages' },
  { icon: Bell, label: 'Notifications', href: '/worker/notifications' },
];

export default function WorkerLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const data = await api.getMe();
        if (cancelled) return;
        const currentUser = data.user || data;
        if (currentUser.role !== 'worker') {
          const destination = currentUser.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
          router.replace(destination);
          return;
        }
        setUser(currentUser);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401 || err.status === 403) {
          router.replace('/login?role=worker');
          return;
        }
        console.error('Failed to verify worker session:', err);
        setLoading(false);
      }
    };
    fetchUser();
    return () => { cancelled = true; };
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'W';
  const displayRating = user?.rating ? user.rating.toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50" role="status" aria-label="Verifying session">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 text-center">
        <div>
          <p className="font-semibold text-neutral-900">Unable to verify your session.</p>
          <button onClick={() => window.location.reload()} className="mt-3 font-semibold text-primary hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-border shadow-sm sticky top-0 z-[60]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-neutral-600" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <img src="/serviqo_favicon.png" alt="Serviqo" className="w-8 h-8" />
              <span className="text-xl font-bold text-text-primary hidden sm:inline-block">Serviqo</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Rating Display (Worker Specific) */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 text-accent-700 rounded-full border border-accent-100">
              <Star className="w-4 h-4 fill-accent-500 text-accent-500" />
              <span className="text-sm font-bold">{displayRating}</span>
            </div>

            <div className="hidden lg:flex items-center gap-4 mr-4">
              <a href="#" className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm">
                <Globe className="w-4 h-4" />
                <span>English</span>
              </a>
              <a href="#" className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </a>
            </div>
            
            <NotificationCenter role="worker" />
            
            <div className="h-8 w-[1px] bg-neutral-200 mx-1 hidden sm:block"></div>
            
            <Link href="/worker/profile" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-100 transition-all group-hover:border-primary shadow-sm flex items-center justify-center bg-primary-subtle">
                {user?.profilePicture ? (
                  <img 
                    src={api.getImageUrl(user.profilePicture)} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-black text-primary">{userInitial}</span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-text-primary leading-none group-hover:text-primary transition-colors">
                  {user?.name || 'Worker'}
                </p>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-wider mt-0.5">
                  {user?.serviceCategory || 'Service Pro'}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-[70] bg-black/50 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-[80] w-64 bg-white border-r border-neutral-200 transition-transform duration-300 transform
          lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6 lg:hidden flex items-center justify-between border-b border-neutral-100">
              <span className="font-bold text-lg text-primary-600">Menu</span>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X className="w-6 h-6 text-neutral-500" />
              </button>
            </div>

            <div className="p-4">
              <div className="lg:hidden mb-6 px-4 py-3 bg-accent-50 text-accent-700 rounded-xl border border-accent-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-accent-500 text-accent-500" />
                  <span className="text-sm font-bold">Rating</span>
                </div>
                <span className="font-black">{displayRating}</span>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200
                        ${isActive 
                          ? 'bg-primary-subtle text-primary border-l-4 border-primary' 
                          : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}
                      `}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-neutral-400'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto p-4 border-t border-neutral-100">
              <Link
                href="/worker/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 font-bold hover:bg-neutral-50 transition-colors"
              >
                <Settings className="w-5 h-5 text-neutral-400" />
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-error font-bold hover:bg-errorLight transition-colors mt-1"
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 min-h-full flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            
            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-border pb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary font-medium">
                <span>© 2026 Serviqo. All rights reserved.</span>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                  <Link href="/privacy-policy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
                  <span className="text-border" aria-hidden="true">·</span>
                  <Link href="/terms-of-service" className="hover:text-text-primary transition-colors">Terms of Service</Link>
                  <span className="text-border" aria-hidden="true">·</span>
                  <Link href="/cookie-policy" className="hover:text-text-primary transition-colors">Cookie Policy</Link>
                  <span className="text-border" aria-hidden="true">·</span>
                  <a href="mailto:help@serviqo.com" className="hover:text-text-primary transition-colors">Help Center</a>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
