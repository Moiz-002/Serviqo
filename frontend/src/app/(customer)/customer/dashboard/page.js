'use client';

import React from 'react';
import { 
  PlusCircle, 
  Briefcase, 
  MessageSquare, 
  Clock, 
  Star, 
  ChevronRight,
  TrendingUp,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { DUMMY_JOBS } from '@/config/job-constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <Card className="p-6 border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="mt-4">
      <p className="text-xs font-black text-text-tertiary uppercase tracking-[0.15em]">{label}</p>
      <h3 className="text-3xl font-black text-text-primary mt-1">{value}</h3>
    </div>
  </Card>
);

export default function CustomerDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            Hello, Zainab! 👋
          </h1>
          <p className="text-text-secondary mt-1 font-medium text-lg">
            Find the best professionals for your home projects today.
          </p>
        </div>
        <Link href="/customer/post-job">
          <Button variant="primary" size="lg" className="rounded-2xl gap-2 shadow-xl shadow-primary/20 group px-8 py-4">
            <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Post a New Job
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Briefcase} 
          label="Active Jobs" 
          value="2" 
          colorClass="bg-primary-subtle text-primary"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Completed" 
          value="14" 
          colorClass="bg-success-light text-success"
        />
        <StatCard 
          icon={MessageSquare} 
          label="Messages" 
          value="5 New" 
          colorClass="bg-info-light text-info"
        />
        <StatCard 
          icon={Star} 
          label="Total Spent" 
          value="45k" 
          colorClass="bg-warning-light text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 border-neutral-200/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h2 className="text-lg font-black text-text-primary uppercase tracking-tight">Recently Posted Jobs</h2>
              <Link href="/customer/my-jobs" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-neutral-100">
              {DUMMY_JOBS.slice(0, 3).map((job) => (
                <div key={job.id} className="p-6 hover:bg-neutral-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-2xl group-hover:bg-primary-subtle transition-colors">
                      {job.id === 'job_001' ? '⚡' : job.id === 'job_002' ? '🔧' : '🧹'}
                    </div>
                    <div>
                      <h4 className="font-black text-text-primary text-lg group-hover:text-primary transition-colors">{job.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-text-tertiary font-bold flex items-center gap-1 uppercase tracking-wider">
                          <MapPin className="w-3 h-3 text-accent" /> {job.location.city}
                        </span>
                        <span className="text-xs text-neutral-300">•</span>
                        <span className="text-xs font-black uppercase text-accent tracking-widest">
                          {job.proposalsCount} Bids received
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/customer/job/${job.id}`} className="p-3 hover:bg-white rounded-xl border border-transparent hover:border-neutral-200 transition-all shadow-sm">
                    <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-primary" />
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* Tips for Customers */}
          <div className="bg-navy-900 text-white rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-2xl border border-navy-800">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">How to hire the best?</h3>
              <ul className="space-y-6">
                <li className="flex gap-5">
                  <div className="w-8 h-8 rounded-xl bg-accent text-navy-900 flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-accent/20">1</div>
                  <div>
                    <p className="text-base text-navy-50 font-bold">Add reference photos</p>
                    <p className="text-sm text-navy-200 mt-1">Detailed visuals lead to 3x more accurate and competitive bids.</p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="w-8 h-8 rounded-xl bg-accent text-navy-900 flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-accent/20">2</div>
                  <div>
                    <p className="text-base text-navy-50 font-bold">Check work portfolios</p>
                    <p className="text-sm text-navy-200 mt-1">Reviewing past projects ensures the professional matches your quality standards.</p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="w-8 h-8 rounded-xl bg-accent text-navy-900 flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-accent/20">3</div>
                  <div>
                    <p className="text-base text-navy-50 font-bold">Communicate on-platform</p>
                    <p className="text-sm text-navy-200 mt-1">Use Serviqo Chat to discuss details and secure your payments automatically.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Notifications */}
        <div className="space-y-6">
          <Card className="p-6 border-neutral-200/60 shadow-sm">
            <h3 className="text-lg font-black text-text-primary mb-6 flex items-center gap-2 uppercase tracking-tight">
              <TrendingUp className="w-5 h-5 text-success" />
              Notifications
            </h3>
            <div className="space-y-6">
              {[
                { title: 'New Proposal', desc: 'Ahmad H. sent a bid for Ceiling Fan installation.', time: '2m ago' },
                { title: 'Job Completed', desc: 'Plumbing repair for Bahria Ph 7 is finished.', time: '1h ago' },
                { title: 'Message Received', desc: 'Sara (Deep Cleaning) sent you a message.', time: '3h ago' },
              ].map((n, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 group-hover:scale-150 transition-transform"></div>
                  <div>
                    <p className="text-sm font-black text-text-primary group-hover:text-primary transition-colors">{n.title}</p>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed font-medium">{n.desc}</p>
                    <span className="text-[10px] font-black text-text-tertiary mt-2 block uppercase tracking-widest">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary-subtle rounded-xl transition-all border border-primary/10">
              View All Notifications
            </button>
          </Card>

          <Card className="p-8 bg-accent text-navy-900 border-none shadow-2xl shadow-accent/20 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <h4 className="font-black text-xl tracking-tight italic">Verified Safety</h4>
              <p className="text-sm text-navy-900/80 mt-3 leading-relaxed font-bold">
                Every pro undergoes mandatory CNIC verification and background checks for your complete peace of mind.
              </p>
              <div className="mt-6 flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-accent overflow-hidden shadow-md">
                    <img src={`/profile_${i === 3 ? '1' : i}.png`} alt="Verified" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-navy-900 text-accent border-2 border-accent flex items-center justify-center text-xs font-black shadow-md">
                  +1k
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
