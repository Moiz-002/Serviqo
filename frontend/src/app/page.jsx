'use client';

import { useState, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import {
  Menu,
  X,
  Zap,
  FileText,
  Gavel,
  CheckCircle,
  Wrench,
  Droplets,
  Hammer,
  Sparkles,
  Wind,
  RefreshCw,
  Bot,
  TrendingUp,
  ShieldCheck,
  Activity,
  MessageSquare,
  Lock,
  ArrowRight,
  Star,
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Phone,
  Mail,
  ArrowUpRight,
  BriefcaseBusiness,
  Cpu,
  User,
  LogOut,
  LayoutDashboard,
  PlusSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import BrandedSelect from '@/components/ui/BrandedSelect';
import * as api from '@/lib/api';
import { getJobCategoryIcon } from '@/config/job-category-icons';
import { CATEGORIES, CITIES } from '@/config/worker-constants';

const AuthSkeleton = () => (
  <div className="flex items-center gap-4 animate-pulse">
    <div className="w-16 h-4 bg-navy-100 rounded-full" />
    <div className="w-24 h-10 bg-navy-100 rounded-xl" />
    <div className="w-24 h-10 bg-navy-100 rounded-xl" />
  </div>
);

// ============================================================================
// NAVBAR COMPONENT
// ============================================================================
const Navbar = ({ user, loading, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollPos > 10);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await onLogout();
    setShowDropdown(false);
  };

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Find Jobs', href: '/jobs' },
    { label: 'Services', href: '#services' },
    { label: 'For Professionals', href: '#for-professionals' },
  ];

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'worker') return '/worker/dashboard';
    return '/customer/dashboard';
  };

  const getPostJobUrl = () => {
    if (!user) return '/login?role=customer&intendedUrl=%2Fcustomer%2Fpost-job';
    if (user.role === 'worker') return '/worker/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/customer/post-job';
  };

  const scrolledClasses = 'bg-white/95 backdrop-blur-md border-b border-navy-100 shadow-md py-3';
  const transparentClasses = 'bg-transparent py-5 max-xl:bg-white max-xl:py-3 max-xl:border-b max-xl:border-navy-100';

  return (
    <nav
      className={`fixed w-full top-0 z-[100] transition-all duration-300 isolate ${
        isScrolled || isOpen ? scrolledClasses : transparentClasses
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 relative pointer-events-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer relative z-[110]">
          <img src="/serviqo_favicon.png" alt="Serviqo Logo" className="w-10 h-10 object-contain rounded-2xl" />
          <span className="text-2xl font-black tracking-tighter text-navy-900">
            Serviqo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-6 2xl:gap-8">
          {navLinks.map((link) => (
            link.href.startsWith('#') ? (
              <a key={link.href} href={link.href} className="text-navy-600 font-bold hover:text-cyan-600 transition-colors relative group cursor-pointer">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full" />
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="text-navy-600 font-bold hover:text-cyan-600 transition-colors relative group cursor-pointer">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full" />
              </Link>
            )
          ))}
        </div>

        {/* Desktop CTA Buttons / Profile */}
        <div className="hidden xl:flex items-center gap-3 2xl:gap-4">
          {loading ? (
            <AuthSkeleton />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-navy-50 transition-all border border-transparent hover:border-navy-100 group"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-navy-100 border-2 border-white shadow-sm group-hover:shadow-md transition-all flex items-center justify-center text-navy-600 font-bold">
                  {user.profilePicture ? (
                    <img src={api.getImageUrl(user.profilePicture)} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-black text-navy-900 leading-none mb-1">{user.name.split(' ')[0]}</p>
                  <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">{user.role}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-navy-100 py-3 animate-fade-in origin-top-right overflow-hidden">
                  <div className="px-5 py-3 border-b border-navy-50 mb-2">
                    <p className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-black text-navy-900 truncate">{user.email || user.phone}</p>
                  </div>
                  
                  <Link
                    href={getDashboardUrl()}
                    className="flex items-center gap-3 px-5 py-3 text-navy-600 hover:text-navy-900 hover:bg-navy-50 transition-colors font-bold"
                    onClick={() => setShowDropdown(false)}
                  >
                    <LayoutDashboard className="w-5 h-5 text-navy-400" />
                    Dashboard
                  </Link>
                  
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/analytics"
                      className="flex items-center gap-3 px-5 py-3 text-navy-600 hover:text-navy-900 hover:bg-navy-50 transition-colors font-bold"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Activity className="w-5 h-5 text-navy-400" />
                      Analytics
                    </Link>
                  )}

                  {user.role === 'customer' && (
                    <Link
                      href="/customer/post-job"
                      className="flex items-center gap-3 px-5 py-3 text-navy-600 hover:text-navy-900 hover:bg-navy-50 transition-colors font-bold"
                      onClick={() => setShowDropdown(false)}
                    >
                      <PlusSquare className="w-5 h-5 text-navy-400" />
                      Post a New Job
                    </Link>
                  )}

                  <div className="h-px bg-navy-50 my-2" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-5 py-3 text-error hover:bg-error-subtle transition-colors font-bold text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-navy-900 font-bold hover:text-cyan-600 transition-colors px-4 py-2 cursor-pointer"
              >
                Sign In
              </Link>
              <Link 
                href={getPostJobUrl()} 
                className="px-5 py-2.5 border-2 border-navy-600 text-navy-600 font-bold rounded-xl hover:bg-navy-50 transition-all"
              >
                Post a Job
              </Link>
              <Link 
                href="/signup" 
                className="px-5 py-2.5 bg-navy-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-200/50 hover:bg-navy-700 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="xl:hidden p-3 text-navy-900 hover:bg-navy-50 rounded-xl transition-colors cursor-pointer relative z-[110]"
          onClick={() => setIsOpen((v) => !v)}
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`xl:hidden absolute top-full left-0 w-full bg-white border-t border-navy-100 shadow-2xl transition-all duration-300 transform ${
          isOpen ? 'translate-y-0 opacity-100 visible pointer-events-auto' : '-translate-y-4 opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            link.href.startsWith('#') ? (
              <a key={link.href} href={link.href} className="block py-3 text-lg font-bold text-navy-600 border-b border-navy-50 cursor-pointer" onClick={() => setIsOpen(false)}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="block py-3 text-lg font-bold text-navy-600 border-b border-navy-50 cursor-pointer" onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            )
          ))}
          <div className="pt-4 space-y-3">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-12 bg-navy-50 rounded-xl" />
                <div className="h-12 bg-navy-50 rounded-xl" />
              </div>
            ) : user ? (
              <>
                <div className="flex items-center gap-4 p-4 bg-navy-50 rounded-2xl mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center text-navy-600 font-black text-xl shadow-sm">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-black text-navy-900">{user.name}</p>
                    <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest">{user.role}</p>
                  </div>
                </div>
                <Link 
                  href={getDashboardUrl()} 
                  className="block text-center py-4 font-bold text-navy-900 border-2 border-navy-100 rounded-xl cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  Go to Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-center py-4 bg-error text-white font-black rounded-xl shadow-lg cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block text-center py-3 font-bold text-navy-900 border-2 border-navy-100 rounded-xl cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="block text-center py-4 bg-navy-600 text-white font-black rounded-xl shadow-lg cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};


// ============================================================================
// HERO SECTION
// ============================================================================
const HeroSection = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    const q = (query || '').trim();
    const city = location.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    const qs = params.toString();
    router.push(`/jobs${qs ? `?${qs}` : ''}`);
  };

  return (
    <section className="relative overflow-hidden bg-neutral-50 pt-28 pb-14 sm:pt-32 sm:pb-20 xl:pt-48 xl:pb-32">
      {/* Decorative Background Glows */}
      <div aria-hidden="true" className="pointer-events-none absolute top-0 right-0 w-1/2 h-full bg-cyan-50/50 blur-[120px] rounded-full -mr-64 -z-10" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 w-1/3 h-full bg-navy-50/50 blur-[100px] rounded-full -ml-32 -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 sm:gap-12 xl:grid-cols-2 xl:gap-16">
          {/* Left Column */}
          <div className="min-w-0 space-y-8 sm:space-y-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-cyan-100 shadow-sm animate-fade-in">
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </div>
              <span className="text-sm font-bold text-navy-900 uppercase tracking-widest">
                AI-Powered Marketplace
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl font-black leading-[1.08] tracking-tighter text-navy-900 sm:text-5xl md:text-6xl xl:text-8xl">
                Good work
                <span className="block text-gradient-primary">starts here.</span>
              </h1>
              <p className="max-w-lg text-lg font-medium leading-relaxed text-navy-600 sm:text-xl">
                Find real home-service opportunities or connect with verified professionals. Clear job details, transparent budgets, and a marketplace built for Pakistan.
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="group relative w-full max-w-2xl">
              <div className="grid grid-cols-1 gap-3 rounded-2xl border border-navy-100 bg-white p-2.5 shadow-xl transition-all group-hover:border-cyan-200 sm:grid-cols-2 sm:rounded-3xl sm:p-3 sm:shadow-2xl">
                <div className="search-field flex min-w-0 items-center gap-3 rounded-xl border border-navy-100 bg-neutral-50 px-3 py-3 transition-colors focus-within:border-cyan-600 sm:rounded-2xl sm:px-4 sm:py-4">
                  <Search className="w-5 h-5 text-navy-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="What do you need help with?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    className="w-full min-w-0 border-0 bg-transparent text-sm font-bold text-navy-900 outline-none placeholder:text-navy-400 sm:text-base"
                  />
                </div>
                <div className="search-field flex min-w-0 items-center gap-3 rounded-xl border border-navy-100 bg-neutral-50 px-3 py-3 transition-colors focus-within:border-cyan-600 sm:rounded-2xl sm:px-4 sm:py-4">
                  <MapPin className="w-5 h-5 text-navy-500 shrink-0" />
                  <BrandedSelect
                    aria-label="Filter jobs by city"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    containerClassName="flex-1"
                    className="min-h-10 min-w-0 flex-1 bg-transparent text-sm font-bold text-navy-900 sm:text-base"
                  >
                    <option value="">All cities</option>
                    {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                  </BrandedSelect>
                </div>
                <button onClick={handleSearch} className="w-full rounded-xl border-0 bg-navy-600 px-6 py-3.5 font-black text-white shadow-lg transition-all hover:bg-navy-700 hover:shadow-cyan-100 active:scale-[0.99] sm:col-span-2 sm:w-auto sm:justify-self-start sm:rounded-2xl sm:px-10 sm:py-4">
                  Find Jobs
                </button>
              </div>
              
              {/* Popular Categories Chips */}
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                <span className="text-sm font-bold text-navy-400 uppercase tracking-wider">Popular:</span>
                {[
                  { label: 'Electrical', category: 'Electrical' },
                  { label: 'Plumbing', category: 'Plumbing' },
                  { label: 'AC & HVAC', category: 'AC & HVAC' },
                  { label: 'Cleaning', category: 'Cleaning' },
                ].map(({ label, category }) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => router.push(`/jobs?category=${encodeURIComponent(category)}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-navy-100 rounded-full text-sm font-bold text-navy-600 hover:border-cyan-500 hover:text-cyan-600 transition-all cursor-pointer"
                  >
                    {(() => {
                      const CategoryIcon = getJobCategoryIcon(category);
                      return <CategoryIcon aria-hidden="true" className="h-4 w-4" />;
                    })()}
                    {label}
                  </button>
                ))}
              </div>
              <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-extrabold text-navy-700 hover:text-cyan-700">
                Browse all jobs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column - Visual Stack */}
          <div className="relative h-[360px] min-w-0 sm:h-[440px] xl:h-[700px]">
            {/* Main Visual Image */}
            <div className="group absolute left-1/2 top-1/2 h-[86%] w-[88%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border-4 border-white shadow-2xl sm:rounded-[40px] sm:border-8 xl:h-[85%] xl:w-[85%]">
              <img
                src="/hero_image.png"
                alt="Expert Professional"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
            </div>

            {/* Floating Card: AI Matching */}
            <div className="absolute right-0 top-0 max-w-[190px] animate-float rounded-2xl border border-cyan-100 bg-white p-3 shadow-xl sm:top-[-10px] sm:max-w-[240px] sm:rounded-3xl sm:p-6 sm:shadow-2xl">
              <div className="mb-3 flex items-center gap-3 sm:mb-4 sm:gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Cpu className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-navy-900 leading-tight">AI Matching</p>
                  <p className="text-xs font-bold text-cyan-600">Finding best pros...</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[85%] animate-pulse" />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-navy-400">
                  <span>ANALYZING PROFILE</span>
                  <span>85%</span>
                </div>
              </div>
            </div>

            {/* Floating Card: Trust Score */}
            <div className="absolute bottom-0 left-0 max-w-[190px] animate-float-delayed rounded-2xl border border-navy-100 bg-white p-3 shadow-xl sm:bottom-10 sm:max-w-[240px] sm:rounded-3xl sm:p-6 sm:shadow-2xl">
              <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-4 border-accent-500 sm:h-10 sm:w-10">
                  <img src="man_image.png" alt="Serviqo professional profile" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-black text-navy-900">Ahmed Hassan</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-navy-600">4.9 (127 reviews)</span>
                  </div>
                </div>
              </div>
              <div className="bg-accent-50 rounded-xl px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] font-black text-accent-700 uppercase">Trust Score</span>
                <span className="text-sm font-black text-accent-700">9.8/10</span>
              </div>
            </div>
            
            {/* Background Accent Shapes */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-10 -left-10 w-32 h-32 border-4 border-cyan-200 rounded-full opacity-20" />
            <div aria-hidden="true" className="pointer-events-none absolute bottom-20 -right-10 w-48 h-48 bg-navy-600 rounded-full opacity-5" />
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// LIVE JOBS
// ============================================================================
const FeaturedJobsSection = () => {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.getPublicJobs('limit=3&status=open')
      .then((data) => {
        if (!cancelled) setJobs(data.jobs || []);
      })
      .catch((error) => {
        if (!cancelled) setJobsError(error.message || 'Unable to load current job requests.');
      })
      .finally(() => {
        if (!cancelled) setLoadingJobs(false);
      });
    return () => { cancelled = true; };
  }, []);

  const browseFilteredJobs = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    router.push(`/jobs${params.size ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="bg-white py-20 sm:py-24" aria-labelledby="featured-jobs-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-cyan-800">
              <BriefcaseBusiness className="h-4 w-4" /> Live from the marketplace
            </div>
            <h2 id="featured-jobs-heading" className="mt-5 text-3xl font-black tracking-tight text-navy-950 sm:text-5xl">
              Find work that fits your skills.
            </h2>
            <p className="mt-3 text-base leading-7 text-navy-600">
              Browse current customer requests. Create an account to submit a proposal or post your own job.
            </p>
          </div>
          <form onSubmit={browseFilteredJobs} className="grid w-full gap-3 rounded-2xl border border-navy-100 bg-neutral-50 p-3 sm:grid-cols-[1fr_1fr_auto] lg:max-w-2xl">
            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-navy-100 bg-white px-3">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-navy-400" />
              <span className="sr-only">Filter featured jobs by service</span>
              <BrandedSelect aria-label="Filter featured jobs by service" value={category} onChange={(event) => setCategory(event.target.value)} getOptionIcon={getJobCategoryIcon} containerClassName="flex-1" className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold text-navy-700">
                <option value="">All services</option>
                {CATEGORIES.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </BrandedSelect>
            </label>
            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-navy-100 bg-white px-3">
              <MapPin className="h-4 w-4 shrink-0 text-navy-400" />
              <span className="sr-only">Filter featured jobs by city</span>
              <BrandedSelect aria-label="Filter featured jobs by city" value={city} onChange={(event) => setCity(event.target.value)} containerClassName="flex-1" className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold text-navy-700">
                <option value="">All cities</option>
                {CITIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </BrandedSelect>
            </label>
            <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-extrabold text-white transition hover:bg-navy-700">
              Filter jobs <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {loadingJobs ? (
          <div className="mt-9 grid gap-4 lg:grid-cols-3" aria-label="Loading latest jobs">
            {[0, 1, 2].map((item) => (
              <div key={item} className="animate-pulse rounded-3xl border border-navy-100 p-6">
                <div className="h-5 w-24 rounded bg-neutral-100" />
                <div className="mt-5 h-6 w-3/4 rounded bg-neutral-100" />
                <div className="mt-3 h-4 w-full rounded bg-neutral-100" />
                <div className="mt-2 h-4 w-2/3 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : jobsError ? (
          <p role="alert" className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{jobsError}</p>
        ) : jobs.length ? (
          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {jobs.map((job) => {
              const CategoryIcon = getJobCategoryIcon(job.category);
              return <article key={job._id} className="flex flex-col rounded-3xl border border-navy-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-extrabold text-cyan-800">
                    <CategoryIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    {job.category}
                  </span>
                  <span className="text-xs font-semibold text-navy-400">{job.location?.city || 'Pakistan'}</span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold leading-snug text-navy-950">{job.title}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-navy-600">{job.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-navy-50 pt-4">
                  <span className="text-sm font-extrabold text-navy-800">{job.budgetRange}</span>
                  <Link href={`/jobs/${job._id}`} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-cyan-800 hover:text-cyan-600">
                    View job <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>;
            })}
          </div>
        ) : (
          <div className="mt-9 rounded-3xl border border-dashed border-navy-200 bg-neutral-50 px-6 py-10 text-center">
            <p className="font-bold text-navy-800">No job requests yet.</p>
            <p className="mt-1 text-sm text-navy-500">Check back soon or explore service categories below.</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/jobs" className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-5 py-3 text-sm font-extrabold text-navy-800 transition hover:border-cyan-400 hover:text-cyan-800">
            Explore all jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// SOCIAL PROOF BAR
// ============================================================================
const SocialProofBar = () => {
  const cities = ['Islamabad', 'Lahore', 'Karachi', 'Rawalpindi', 'Peshawar', 'Faisalabad', 'Multan', 'Quetta'];
  
  const stats = [
    { label: 'Jobs Posted', value: '12,000+', color: 'text-navy-600', icon: FileText },
    { label: 'Verified Professionals', value: '4,800+', color: 'text-cyan-600', icon: ShieldCheck },
    { label: 'Satisfaction Rate', value: '98%', color: 'text-accent-600', icon: Star },
  ];

  return (
    <section className="py-12 bg-neutral-50 border-y border-navy-100 overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <p className="text-center text-navy-500 font-semibold uppercase tracking-widest text-sm mb-8 animate-fade-in">
          Trusted by homeowners and professionals across Pakistan
        </p>

        {/* Seamless Infinite Marquee */}
        <div className="relative flex overflow-x-hidden group">
          <div className="flex py-4 animate-marquee whitespace-nowrap">
            {[...cities, ...cities, ...cities].map((city, idx) => (
              <div key={idx} className="flex items-center mx-8">
                <span className="text-navy-900 font-bold text-lg hover:text-cyan-500 transition-colors cursor-default">
                  {city}
                </span>
                <span className="ml-8 w-2 h-2 rounded-full bg-cyan-200" />
              </div>
            ))}
          </div>
          {/* Gradient Overlays for smooth edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-neutral-50 to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-neutral-50 to-transparent z-10" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="bg-white p-8 rounded-2xl border border-navy-100 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-300 group flex items-center gap-6"
              >
                <div className="w-14 h-14 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-cyan-50 transition-colors">
                  <Icon className="w-7 h-7 text-navy-600 group-hover:text-cyan-600" />
                </div>
                <div>
                  <p className={`text-3xl lg:text-4xl font-black ${stat.color} tracking-tight`}>
                    {stat.value}
                  </p>
                  <p className="text-navy-500 font-bold mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

// ============================================================================
// HOW IT WORKS
// ============================================================================
const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      icon: FileText,
      title: 'Post Your Job',
      description: 'Customer posts job with details, budget in PKR, location, and reference photos.',
      color: 'navy'
    },
    {
      number: '02',
      icon: Cpu,
      title: 'Receive Competitive Bids',
      description: 'Verified professionals submit proposals; our AI Pricing Advisor shows fair price ranges instantly.',
      color: 'accent'
    },
    {
      number: '03',
      icon: CheckCircle,
      title: 'Hire & Track',
      description: 'Compare bids, hire your professional, and track progress in real time with in-app messaging.',
      color: 'navy'
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-navy-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-bold text-cyan-700 uppercase tracking-widest">
              Simple Process
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 mt-4 tracking-tight">
            How It <span className="text-gradient-accent">Works</span>
          </h2>
          <p className="text-navy-600/80 mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
            Connect with skilled professionals in three simple steps. Our intelligent system ensures quality matches and fair pricing.
          </p>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Dashed) */}
          <div className="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 border-t-2 border-dashed border-cyan-200 -z-10 mx-20" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="group relative">
                {/* Step Number (Large Background) */}
                <div aria-hidden="true" className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 text-[120px] font-black text-navy-50/50 select-none transition-all group-hover:text-cyan-50/70 group-hover:-translate-y-2 duration-500">
                  {step.number}
                </div>

                {/* Card */}
                <div className="relative bg-white p-8 rounded-3xl border border-navy-100 shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all duration-500 group-hover:-translate-y-2">
                  {/* Icon Box */}
                  <div className="relative flex justify-center mb-8">
                    <div className={`w-20 h-20 ${step.color === 'accent' ? 'bg-gradient-accent shadow-glow-accent' : 'bg-gradient-primary shadow-glow-primary'} rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500`}>
                      <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border border-navy-100 flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-navy-900">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 text-center">
                    <h3 className="text-2xl font-bold text-navy-900 group-hover:text-cyan-700 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-navy-600 leading-relaxed text-base">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow for mobile (except last) */}
                  {idx < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-8">
                      <ChevronRight className="w-6 h-6 text-cyan-300 rotate-90" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// SERVICE CATEGORIES
// ============================================================================
const ServiceCategoriesSection = () => {
  const categories = [
    {
      name: 'Electrical',
      icon: Zap,
      image: 'electrician_image.png',
      description: 'Wiring, repairs, and installations'
    },
    {
      name: 'Plumbing',
      icon: Droplets,
      image: 'plumbing_image.png',
      description: 'Leak fixes and pipe installations'
    },
    {
      name: 'Carpentry',
      icon: Hammer,
      image: 'carpenting_image.png',
      description: 'Custom furniture and wood repairs'
    },
    {
      name: 'Cleaning',
      icon: Sparkles,
      image: 'home_cleaning.png',
      description: 'Deep cleaning and sanitization'
    },
    {
      name: 'Appliance Repair',
      icon: RefreshCw,
      image: 'application_repair.png',
      description: 'Fridge, washing machine, and more'
    },
    {
      name: 'AC & HVAC',
      icon: Wind,
      image: 'ac_repair.png',
      description: 'AC servicing and gas refilling'
    },
  ];

  return (
    <section id="services" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-50 border border-navy-100 mb-6">
              <Wrench className="w-4 h-4 text-navy-600" />
              <span className="text-sm font-bold text-navy-700 uppercase tracking-widest">
                Our Services
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 tracking-tighter">
              Expert Help for <span className="text-gradient-primary">Every Need</span>
            </h2>
            <p className="text-lg text-navy-600 mt-6 leading-relaxed">
              From quick fixes to major renovations, find verified professionals who get the job done right.
            </p>
          </div>
          <Link href="/jobs" className="px-8 py-4 bg-white border-2 border-navy-100 rounded-2xl font-bold text-navy-900 hover:border-cyan-500 hover:text-cyan-600 transition-all flex items-center gap-2 group shadow-sm cursor-pointer">
            Explore Open Jobs
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={idx}
                    href={`/jobs?category=${encodeURIComponent(cat.name)}`}
                    className="group relative h-[400px] rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Gradient Overlays */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-[32px] transition-all m-4" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 group-hover:bg-cyan-500 group-hover:border-cyan-400 transition-all duration-500">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black !text-white mb-2">{cat.name}</h3>
                  <p className="text-white/70 font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {cat.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-cyan-400 font-bold group-hover:text-white transition-colors">
                    <span>Browse related jobs</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
                  </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// WHY SERVIQO - FEATURES
// ============================================================================
const WhyServiqoSection = () => {
  const features = [
    {
      icon: Bot,
      title: 'AI Recruiter Agent',
      description: 'We find the right worker before you even ask. Our smart matching system analyzes skills, ratings, and location instantly.',
      color: 'bg-secondary-50',
      iconColor: 'text-secondary-600',
      size: 'large'
    },
    {
      icon: TrendingUp,
      title: 'Pricing Advisor',
      description: 'Know fair market rates instantly, in PKR.',
      color: 'bg-primary-50',
      iconColor: 'text-primary-600',
      size: 'small'
    },
    {
      icon: ShieldCheck,
      title: 'Verified Pros',
      description: 'Every worker reviewed and CNIC verified.',
      color: 'bg-accent-50',
      iconColor: 'text-accent-600',
      size: 'small'
    },
    {
      icon: Lock,
      title: 'Guardian AI',
      description: 'Smart protection against suspicious activity. Your safety is our top priority.',
      color: 'bg-navy-900',
      iconColor: 'text-white',
      textColor: 'text-white',
      subTextColor: 'text-navy-200',
      size: 'large'
    },
    {
      icon: Activity,
      title: 'Real-Time Tracking',
      description: 'Follow your job progress live.',
      color: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      size: 'small'
    },
    {
      icon: MessageSquare,
      title: 'Direct Chat',
      description: 'Talk securely within the app.',
      color: 'bg-neutral-100',
      iconColor: 'text-navy-600',
      size: 'small'
    },
  ];

  return (
    <section id="why-serviqo" className="py-24 sm:py-32 bg-neutral-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 mb-6">
            <Cpu className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-bold text-cyan-700 uppercase tracking-widest">
              The Serviqo Edge
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 tracking-tighter">
            Intelligence Meets <span className="text-gradient-primary">Integrity</span>
          </h2>
          <p className="text-lg text-navy-600 mt-6 max-w-2xl mx-auto font-medium leading-relaxed">
            We&apos;ve reimagined home services from the ground up, using AI to ensure fairness and quality for everyone.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 lg:gap-8 h-auto lg:h-[700px]">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`group relative p-8 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-navy-100/50 flex flex-col justify-between ${
                  feature.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'
                } ${feature.color}`}
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${
                    feature.textColor === 'text-white' ? 'bg-white/10 border border-white/20' : 'bg-white shadow-navy-100'
                  }`}>
                    <Icon className={`w-7 h-7 ${feature.iconColor}`} strokeWidth={2} />
                  </div>
                  <h3 className={`text-2xl font-black mb-3 ${feature.textColor || 'text-navy-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-base font-medium leading-relaxed ${feature.subTextColor || 'text-navy-600'}`}>
                    {feature.description}
                  </p>
                </div>
                
                {/* Visual Accent for large cards */}
                {feature.size === 'large' && (
                  <div className="mt-8 flex justify-end">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className={`${feature.textColor || 'text-navy-900'}`} />
                    </div>
                  </div>
                )}
                
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// FOR PROFESSIONALS - GROW YOUR BUSINESS
// ============================================================================
const ForProfessionalsSection = () => {
  return (
    <section id="for-professionals" className="py-24 sm:py-32 relative overflow-hidden bg-navy-900">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,var(--navy-600),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,var(--cyan-600),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Right: Content (Reversed on mobile for better flow) */}
          <div className="space-y-10 order-2 lg:order-1">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white uppercase tracking-widest">Growth Engine</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-7xl !text-white font-black tracking-tighter leading-tight">
                Your Skills, <br /> Our <span className="text-cyan-400">Scale.</span>
              </h2>
              <p className="text-xl text-navy-100 max-w-lg leading-relaxed font-medium">
                The ultimate platform for Pakistani professionals. Stop chasing leads and start building a high-rated, verified business.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Zero Commission', desc: 'Keep 100% of what you earn.' },
                { title: 'AI Discovery', desc: 'Get matched with ideal jobs.' },
                { title: 'Verified Profile', desc: 'Build trust with CNIC verification.' },
                { title: 'Smart Payments', desc: 'Transparent PKR transactions.' },
              ].map((point, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{point.title}</p>
                    <p className="text-sm text-navy-200">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup?role=worker" className="px-10 py-5 bg-cyan-500 text-navy-900 font-black rounded-2xl hover:bg-cyan-400 shadow-xl shadow-cyan-500/20 transition-all transform hover:-translate-y-1 cursor-pointer">
                  Join as a Professional
                </Link>
                <Link href="#testimonials" className="px-10 py-5 border-2 border-white/20 text-white font-black rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                  Learn Success Stories
                </Link>
            </div>
          </div>

          {/* Left: Interactive Dashboard Mockup */}
          <div className="relative order-1 lg:order-2">
            <div className="relative z-10 rounded-[40px] border-[12px] border-navy-800 shadow-2xl overflow-hidden bg-white">
              <img
                src="man_image.png"
                alt="Professional Dashboard"
                className="w-full h-[500px] object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
              />
              
              {/* Overlay Statistics */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between bg-gradient-to-t from-navy-900/90 to-transparent">
                <div className="flex justify-between items-start">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <p className="text-navy-100 text-xs font-bold uppercase tracking-widest mb-1">Total Earnings</p>
                    <p className="text-3xl font-black text-white">PKR 85,400</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-navy-900" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-3xl p-6 shadow-2xl border border-navy-100 animate-fade-up">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-navy-900 leading-tight">Success Rating</p>
                        <p className="text-xs font-bold text-navy-400">Top 1% Professional</p>
                      </div>
                      <div className="ml-auto text-2xl font-black text-navy-900">4.9</div>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 5 ? 'bg-cyan-500' : 'bg-neutral-100'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full -z-10" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-navy-500/20 blur-[100px] rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// TESTIMONIALS
// ============================================================================
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote:
        "Finding a reliable electrician in Islamabad used to be such a hassle. Serviqo connected me with Ahmed in minutes. Professional, punctual, and fair pricing. Highly recommend!",
      name: 'Fatima Khan',
      role: 'Homeowner, Islamabad',
      rating: 5,
      avatar: 'profile_1.png',
    },
    {
      quote:
        "As a certified plumber, Serviqo has been a game-changer for my business. I get quality leads without paying upfront commissions. My earnings have doubled in 3 months.",
      name: 'Mohammad Ali',
      role: 'Verified Plumber, Lahore',
      rating: 5,
      avatar: 'man_image.png',
    },
    {
      quote:
        "The pricing transparency is amazing. No more guessing if I'm getting ripped off. Three bids in 10 minutes, and I hired the perfect carpenter for my kitchen renovation.",
      name: 'Ayesha Malik',
      role: 'Homeowner, Karachi',
      rating: 5,
      avatar: 'profile_2.png',
    },
  ];

  return (
    <section id="testimonials" className="py-24 sm:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-50 border border-navy-100 mb-6">
            <Star className="w-4 h-4 text-cyan-500 fill-cyan-500" />
            <span className="text-sm font-bold text-navy-700 uppercase tracking-widest">
              Success Stories
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 tracking-tighter">
            Trusted by <span className="text-gradient-primary">Thousands</span>
          </h2>
          <p className="text-lg text-navy-600 mt-6 max-w-2xl mx-auto font-medium leading-relaxed">
            Join the growing community of satisfied homeowners and skilled professionals in Pakistan.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="group relative bg-neutral-50 rounded-[40px] p-8 lg:p-10 border border-navy-100/50 hover:bg-white hover:shadow-2xl hover:border-cyan-100 transition-all duration-500"
            >
              {/* Quote Icon */}
              <div aria-hidden="true" className="pointer-events-none absolute top-8 right-8 text-6xl text-navy-100/50 group-hover:text-cyan-100 transition-colors font-serif">
                “
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-8">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Quote Text */}
              <p className="text-lg text-navy-900 font-medium leading-relaxed mb-10 italic">
                &quot;{testimonial.quote}&quot;
              </p>

              {/* Profile */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-navy-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform" />
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="relative w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
                  />
                </div>
                <div>
                  <p className="font-black text-navy-900 text-lg">{testimonial.name}</p>
                  <p className="text-navy-500 font-bold text-sm uppercase tracking-wider">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// CTA BANNER
// ============================================================================
const CTABannerSection = ({ user }) => {
  const getPostJobUrl = () => {
    if (!user) return '/login?role=customer&intendedUrl=%2Fcustomer%2Fpost-job';
    if (user.role === 'worker') return '/worker/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/customer/post-job';
  };

  const getJoinAsProUrl = () => {
    if (!user) return '/signup?role=worker';
    if (user.role === 'worker') return '/worker/dashboard';
    return '/customer/dashboard';
  };

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-navy-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-cta opacity-40" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      
      {/* Animated Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-24 h-24 text-white/5 animate-float">
          <Wrench className="w-full h-full" />
        </div>
        <div className="absolute bottom-20 right-10 w-32 h-32 text-white/5 animate-float-delayed">
          <Cpu className="w-full h-full" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black !text-white mb-8 tracking-tighter leading-tight">
            Ready to Experience <br /> the <span className="text-cyan-400">Future?</span>
          </h2>
          <p className="text-xl sm:text-2xl text-navy-100 mb-12 font-medium leading-relaxed">
            Join thousands of homeowners and professionals already transforming the home service industry in Pakistan.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href={getPostJobUrl()} className="px-12 py-5 bg-cyan-500 text-navy-900 font-black rounded-2xl hover:bg-cyan-400 shadow-xl shadow-cyan-500/20 transition-all transform hover:-translate-y-1">
              Post a Job — It&apos;s Free
            </Link>
            <Link href={getJoinAsProUrl()} className="px-12 py-5 border-2 border-white text-white font-black rounded-2xl hover:bg-white/10 transition-all">
              Join as a Professional
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2 text-white text-sm font-bold uppercase tracking-widest">
              <ShieldCheck className="w-5 h-5" />
              Secure Payments
            </div>
            <div className="flex items-center gap-2 text-white text-sm font-bold uppercase tracking-widest">
              <CheckCircle className="w-5 h-5" />
              Verified Experts
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// FOOTER
// ============================================================================
const FooterSection = () => {
  return (
    <footer className="bg-navy-950 text-white relative pt-24 pb-12 overflow-hidden">
      {/* Top Border Gradient Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-cta" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <img src="/serviqo_favicon.png" alt="Serviqo Logo" className="w-12 h-12 object-contain rounded-2xl" />
              <span className="text-3xl font-black text-white tracking-tighter">Serviqo</span>
            </Link>
            <p className="text-lg text-navy-200 font-medium leading-relaxed max-w-sm">
              The AI-powered marketplace reimagining home services for the modern world. Intelligence meets integrity.
            </p>
            <a href="mailto:help@serviqo.com" className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-cyan-500">
              <Mail className="h-5 w-5" /> Contact Serviqo
            </a>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="!text-white font-black text-lg mb-8 uppercase tracking-widest">Platform</h4>
              <ul className="space-y-4 text-navy-100 font-bold">
                {[
                  { label: 'Post a Job', href: '/login?role=customer&intendedUrl=%2Fcustomer%2Fpost-job' },
                  { label: 'Browse Jobs', href: '/jobs' },
                  { label: 'How It Works', href: '#how-it-works' },
                  { label: 'Safety & Support', href: 'mailto:help@serviqo.com?subject=Serviqo%20Safety%20and%20Support' },
                ].map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith('/') ? <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link> : <a href={item.href} className="hover:text-white transition-colors">{item.label}</a>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="!text-white font-black text-lg mb-8 uppercase tracking-widest">Company</h4>
              <ul className="space-y-4 text-navy-100 font-bold">
                {[
                  { label: 'Our Mission', href: '#why-serviqo' },
                  { label: 'Success Stories', href: '#testimonials' },
                  { label: 'Partnerships', href: 'mailto:help@serviqo.com?subject=Serviqo%20Partnership' },
                  { label: 'News & Updates', href: 'mailto:help@serviqo.com?subject=Serviqo%20News%20and%20Updates' },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="hover:text-white transition-colors">{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="!text-white font-black text-lg mb-8 uppercase tracking-widest">Support</h4>
              <ul className="space-y-4 text-navy-100 font-bold">
                <li><a href="mailto:help@serviqo.com" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="mailto:help@serviqo.com?subject=Serviqo%20Trust%20and%20Safety" className="hover:text-white transition-colors">Trust Center</a></li>
                <li><a href="mailto:help@serviqo.com?subject=Serviqo%20Terms%20of%20Use" className="hover:text-white transition-colors">Terms of Use questions</a></li>
                <li><a href="mailto:help@serviqo.com?subject=Serviqo%20Privacy" className="hover:text-white transition-colors">Privacy questions</a></li>
                <li><a href="mailto:help@serviqo.com?subject=Serviqo%20Cookies" className="hover:text-white transition-colors">Cookie questions</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-sm font-bold text-white/70">
          <div className="flex flex-wrap justify-center items-center gap-6">
            <p>© 2026 SERVIQO PLATFORM. ALL RIGHTS RESERVED.</p>
            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-navy-800" />
            <p>MADE WITH ❤️ IN PAKISTAN</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 text-white/70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              SYSTEMS ONLINE
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white">PKR</span> CURRENCY SUPPORTED
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getMe();
        setUser(data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar user={user} loading={loading} onLogout={handleLogout} />
      <HeroSection />
      <FeaturedJobsSection />
      <SocialProofBar />
      <HowItWorksSection />
      <ServiceCategoriesSection />
      <WhyServiqoSection />
      <ForProfessionalsSection />
      <TestimonialsSection />
      <CTABannerSection user={user} />
      <FooterSection />
    </main>
  );
}
