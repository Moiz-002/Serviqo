'use client';

import { Globe, HelpCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export const AuthShell = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <nav className="bg-surface border-b border-border shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
        <Link href="/">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src="/serviqo_favicon.png" alt="Serviqo Icon" className="w-8 h-8" />
            
          </div>
          <span className="text-xl font-bold text-text-primary">Serviqo</span>
        </div>
        </Link>

          {/* Right Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="flex items-center gap-1.5 text-text-accent hover:text-primary transition-colors text-sm">
              <Globe className="w-4 h-4" />
              <span>English</span>
            </a>
            <a href="mailto:help@serviqo.com" className="flex items-center gap-1.5 text-text-accent hover:text-primary transition-colors text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
          <span>© 2026 Serviqo. All rights reserved.</span>
          <nav aria-label="Legal and support links" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </Link>
            <span className="text-border" aria-hidden="true">·</span>
            <Link href="/terms-of-service" className="hover:text-text-primary transition-colors">
              Terms of Service
            </Link>
            <span className="text-border" aria-hidden="true">·</span>
            <Link href="/cookie-policy" className="hover:text-text-primary transition-colors">
              Cookie Policy
            </Link>
            <span className="text-border" aria-hidden="true">·</span>
            <a href="mailto:help@serviqo.com" className="inline-flex items-center gap-1 hover:text-text-primary transition-colors">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
};
