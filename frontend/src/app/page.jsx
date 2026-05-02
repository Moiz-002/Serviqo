'use client';

import { useState, useEffect } from 'react';
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
  ChevronRight,
  Phone,
  Mail,
  ArrowUpRight,
  Cpu,
} from 'lucide-react';
import { FaTwitter, FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import Link from 'next/link';
import Button from '@/components/ui/Button';

// ============================================================================
// NAVBAR COMPONENT
// ============================================================================
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Services', href: '#services' },
    { label: 'For Professionals', href: '#for-professionals' },
  ];

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white backdrop-blur-lg border-b border-navy-100 shadow-md py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <img src="/serviqo_favicon.png" alt="Serviqo Logo" className="w-10 h-10 object-contain rounded-2xl" />
          <span className={`text-2xl font-black tracking-tighter transition-colors ${isScrolled ? 'text-navy-900' : 'text-navy-900'}`}>
            Serviqo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-navy-600 font-bold hover:text-cyan-600 transition-colors relative group cursor-pointer"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="/login"
            className="text-navy-900 font-bold hover:text-cyan-600 transition-colors px-4 py-2 cursor-pointer"
          >
            Sign In
          </a>
          <Button variant="outline" size="md" className="cursor-pointer">
            Post a Job
          </Button>
          <Button variant="primary" size="md" className="cursor-pointer shadow-lg hover:shadow-cyan-200/50">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-3 text-navy-900 hover:bg-navy-50 rounded-xl transition-colors cursor-pointer z-50 relative pointer-events-auto"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white border-t border-navy-100 shadow-2xl transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-4 opacity-0 invisible'}`}>
        <div className="container mx-auto px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-3 text-lg font-bold text-navy-600 border-b border-navy-50 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 space-y-3">
            <a href="/login" className="block text-center py-3 font-bold text-navy-900 border-2 border-navy-100 rounded-xl cursor-pointer">
              Sign In
            </a>
            <Button variant="primary" size="lg" className="w-full cursor-pointer shadow-lg">
              Get Started
            </Button>
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
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-neutral-50">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-cyan-50/50 blur-[120px] rounded-full -mr-64 -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-navy-50/50 blur-[100px] rounded-full -ml-32 -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-10">
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
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-navy-900 leading-[1.1] tracking-tighter">
                Skilled Pros,
                <span className="block text-gradient-primary">At Your Door.</span>
              </h1>
              <p className="text-xl text-navy-600 max-w-lg leading-relaxed font-medium">
                The intelligent way to hire home services in Pakistan. Get instant quotes, AI-matched workers, and transparent PKR pricing.
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative group max-w-2xl">
              <div className="flex flex-wrap bg-white rounded-3xl p-3 shadow-2xl border border-navy-100 gap-3 group-hover:border-cyan-200 transition-all">
                <div className="flex-1 min-w-[280px] flex items-center gap-3 px-4 py-4 bg-neutral-50 rounded-2xl border border-transparent focus-within:border-cyan-500 transition-all">
                  <Search className="w-5 h-5 text-navy-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="What do you need help with?"
                    className="w-full bg-transparent outline-none font-bold text-navy-900 placeholder:text-navy-400 text-base"
                  />
                </div>
                <div className="flex-1 min-w-[200px] flex items-center gap-3 px-4 py-4 bg-neutral-50 rounded-2xl border border-transparent focus-within:border-cyan-500 transition-all">
                  <MapPin className="w-5 h-5 text-navy-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter city or area"
                    className="w-full bg-transparent outline-none font-bold text-navy-900 placeholder:text-navy-400 text-base"
                  />
                </div>
                <button className="w-full sm:w-auto sm:px-10 py-4 bg-navy-600 text-white font-black rounded-2xl hover:bg-navy-700 shadow-lg hover:shadow-cyan-100 transition-all active:scale-95 cursor-pointer">
                  Find Help
                </button>
              </div>
              
              {/* Popular Categories Chips */}
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                <span className="text-sm font-bold text-navy-400 uppercase tracking-wider">Popular:</span>
                {['Electrician', 'Plumber', 'AC Repair', 'Cleaning'].map((cat) => (
                  <button key={cat} className="px-4 py-1.5 bg-white border border-navy-100 rounded-full text-sm font-bold text-navy-600 hover:border-cyan-500 hover:text-cyan-600 transition-all cursor-pointer">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Visual Stack */}
          <div className="relative h-[500px] lg:h-[700px]">
            {/* Main Visual Image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white group">
              <img
                src="/hero_image.png"
                alt="Expert Professional"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
            </div>

            {/* Floating Card: AI Matching */}
            <div className="absolute top-10 right-0 bg-white rounded-3xl shadow-2xl p-6 border border-cyan-100 animate-float max-w-[240px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center">
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
            <div className="absolute bottom-10 left-0 bg-white rounded-3xl shadow-2xl p-6 border border-navy-100 animate-float-delayed max-w-[240px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full border-4 border-accent-500 overflow-hidden">
                  <img src="man_image.png" className="w-full h-full object-cover" />
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
            <div className="absolute -top-10 -left-10 w-32 h-32 border-4 border-cyan-200 rounded-full opacity-20" />
            <div className="absolute bottom-20 -right-10 w-48 h-48 bg-navy-600 rounded-full opacity-5" />
          </div>
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
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[120px] font-black text-navy-50/50 select-none transition-all group-hover:text-cyan-50/70 group-hover:-translate-y-2 duration-500">
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
          <button className="px-8 py-4 bg-white border-2 border-navy-100 rounded-2xl font-bold text-navy-900 hover:border-cyan-500 hover:text-cyan-600 transition-all flex items-center gap-2 group shadow-sm">
            View All Services
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <a
                key={idx}
                href="#browse"
                className="group relative h-[400px] rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-[32px] transition-all m-4" />

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
                    <span>Hire Professional</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </a>
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
    <section className="py-24 sm:py-32 bg-neutral-50 overflow-hidden">
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
            We've reimagined home services from the ground up, using AI to ensure fairness and quality for everyone.
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
              <button className="px-10 py-5 bg-cyan-500 text-navy-900 font-black rounded-2xl hover:bg-cyan-400 shadow-xl shadow-cyan-500/20 transition-all transform hover:-translate-y-1">
                Join as a Professional
              </button>
              <button className="px-10 py-5 border-2 border-white/20 text-white font-black rounded-2xl hover:bg-white/10 transition-all">
                Learn Success Stories
              </button>
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
    <section className="py-24 sm:py-32 bg-white overflow-hidden">
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
              <div className="absolute top-8 right-8 text-6xl text-navy-100/50 group-hover:text-cyan-100 transition-colors font-serif">
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
                "{testimonial.quote}"
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
const CTABannerSection = () => {
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
          <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-tight">
            Ready to Experience <br /> the <span className="text-cyan-400">Future?</span>
          </h2>
          <p className="text-xl sm:text-2xl text-navy-100 mb-12 font-medium leading-relaxed">
            Join thousands of homeowners and professionals already transforming the home service industry in Pakistan.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button variant="accent" size="xl" className="px-12 cursor-pointer shadow-glow-accent hover:scale-105 active:scale-95 transition-all">
              Post a Job — It's Free
            </Button>
            <Button variant="outline" size="xl" className="px-12 !border-white !text-white hover:!bg-white/10 cursor-pointer hover:scale-105 active:scale-95 transition-all">
              Join as a Professional
            </Button>
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
            <div className="flex gap-4">
              {[
                { icon: FaTwitter, href: '#' },
                { icon: FaLinkedin, href: '#' },
                { icon: FaInstagram, href: '#' },
                { icon: FaFacebook, href: '#' },
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all cursor-pointer border border-white/10"
                  >
                    <Icon className="w-6 h-6 hover:text-white" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="!text-white font-black text-lg mb-8 uppercase tracking-widest">Platform</h4>
              <ul className="space-y-4 text-navy-100 font-bold">
                {['Post a Job', 'Browse Experts', 'How It Works', 'Safety First'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors cursor-pointer">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="!text-white font-black text-lg mb-8 uppercase tracking-widest">Company</h4>
              <ul className="space-y-4 text-navy-100 font-bold">
                {['Our Mission', 'Success Stories', 'Partnerships', 'Newsroom'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors cursor-pointer">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="!text-white font-black text-lg mb-8 uppercase tracking-widest">Support</h4>
              <ul className="space-y-4 text-navy-100 font-bold">
                {['Help Center', 'Trust Center', 'Terms of Use', 'Privacy Policy'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors cursor-pointer">{item}</a>
                  </li>
                ))}
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
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <HowItWorksSection />
      <ServiceCategoriesSection />
      <WhyServiqoSection />
      <ForProfessionalsSection />
      <TestimonialsSection />
      <CTABannerSection />
      <FooterSection />
    </main>
  );
}
