'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Globe, 
  HelpCircle, 
  Bell, 
  User,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { ADMIN_NAV_ITEMS } from '@/config/admin-constants';

export default function AdminDashboardLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSidebarOpen]);

  const NavContent = () => (
    <>
      <div className="p-4 space-y-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-navy-50 text-navy-600' 
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-navy-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-navy-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
              <span className="font-medium">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-navy-600"></div>}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto p-4 border-t border-neutral-200">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-neutral-600 hover:bg-error-light hover:text-error rounded-xl transition-all duration-200 group">
          <LogOut className="w-5 h-5 text-neutral-400 group-hover:text-error" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2">
                <img src="/serviqo_favicon.png" alt="Serviqo Icon" className="w-8 h-8" />
                <span className="text-xl font-bold text-neutral-900 hidden xs:block">Serviqo Admin</span>
              </div>
            </Link>
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-2 sm:gap-6">
            <button className="p-2 text-neutral-500 hover:text-navy-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
            
            <div className="h-8 w-px bg-neutral-200 hidden xs:block"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-semibold shrink-0">
                A
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-neutral-900 leading-none">System Admin</p>
                <p className="text-xs text-neutral-500 mt-1">Super Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400 hidden sm:block" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-navy-950/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Mobile Sidebar Drawer */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <img src="/serviqo_favicon.png" alt="Serviqo Icon" className="w-6 h-6" />
              <span className="font-bold text-neutral-900">Admin Panel</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-neutral-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <NavContent />
        </aside>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-neutral-200 overflow-y-auto shrink-0">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
          
          {/* Footer inside main content to stick at bottom if content is short */}
          <footer className="mt-12 py-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
            <span>© 2026 Serviqo Admin. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-navy-900 transition-colors">Privacy</a>
              <span className="text-neutral-300">·</span>
              <a href="#" className="hover:text-navy-900 transition-colors">Terms</a>
              <span className="text-neutral-300">·</span>
              <a href="#" className="hover:text-navy-900 transition-colors">Support</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

