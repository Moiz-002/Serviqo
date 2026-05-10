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
  Globe,
  HelpCircle,
  ChevronRight,
  Search
} from 'lucide-react';
import * as api from '@/lib/api';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/worker/dashboard' },
  { icon: User, label: 'My Profile', href: '/worker/profile' },
  { icon: Wrench, label: 'Skills & Services', href: '/worker/skills' },
  { icon: ImageIcon, label: 'Portfolio', href: '/worker/portfolio' },
  { icon: Calendar, label: 'Availability', href: '/worker/availability' },
  { icon: Star, label: 'Reviews', href: '/worker/reviews' },
];

export default function WorkerLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getMe();
        setUser(data.user || data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

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
            
            <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full relative transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>
            
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
                <div className="flex items-center gap-4">
                  <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
                  <span className="text-border">·</span>
                  <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
                  <span className="text-border">·</span>
                  <a href="#" className="hover:text-text-primary transition-colors">Help Center</a>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
