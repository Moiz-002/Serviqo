'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  MessageSquare, 
  PlusCircle,
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Globe,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/customer/dashboard' },
  { icon: Briefcase, label: 'My Jobs', href: '/customer/my-jobs' },
  { icon: MessageSquare, label: 'Messages', href: '/customer/messages' },
  { icon: User, label: 'Profile', href: '/customer/profile' },
];

export default function CustomerLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-neutral-50 flex-col">
      {/* Navbar (Auth Style) */}
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
            <div className="hidden md:flex items-center gap-4 mr-4">
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
            
            <Link href="/customer/profile" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-100 transition-transform group-hover:scale-105">
                <img 
                  src="/profile_2.png" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://ui-avatars.com/api/?name=Zainab+R&background=1E3A8A&color=fff";
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-text-primary hidden sm:block">Zainab R.</span>
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
              <Link 
                href="/customer/post-job" 
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-fg rounded-xl font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary-500/10 mb-6 group"
              >
                <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90" />
                Post a New Job
              </Link>

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
                href="/customer/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 font-bold hover:bg-neutral-50 transition-colors"
              >
                <Settings className="w-5 h-5 text-neutral-400" />
                Settings
              </Link>
              <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-error font-bold hover:bg-errorLight transition-colors mt-1">
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
            
            {/* Auth Style Footer */}
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
