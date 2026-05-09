'use client';

import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { colors } from '@/config/color-system';
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
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link href="/worker/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-neutral-900 tracking-tight">Serviqo</span>
            </Link>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6 text-neutral-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-50 text-primary-600 shadow-sm' 
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-neutral-900 truncate">Ahmad Hassan</p>
                <p className="text-xs text-neutral-500 truncate">Electrician</p>
              </div>
            </div>
            <Link
              href="/worker/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-neutral-400" />
              Settings
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-error hover:bg-errorLight transition-colors mt-1"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-neutral-600" />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full border border-neutral-200 w-64">
              <Search className="w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search jobs, reviews..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-1 md:gap-2 px-3 py-1.5 bg-accent-50 text-accent-700 rounded-full border border-accent-100">
              <Star className="w-4 h-4 fill-accent-500 text-accent-500" />
              <span className="text-sm font-bold">4.8</span>
            </div>
            <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full relative transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-neutral-200 mx-1 hidden sm:block"></div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-100 hidden sm:block">
              <img 
                src="/profile_1.png" 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://ui-avatars.com/api/?name=Ahmad+Hassan&background=1E3A8A&color=fff";
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
