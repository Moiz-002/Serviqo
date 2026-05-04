import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Briefcase, 
  AlertTriangle, 
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin/dashboard' },
  { icon: Users, label: 'User Management', href: '/admin/users' },
  { icon: ShieldCheck, label: 'Worker Verification', href: '/admin/verification' },
  { icon: Briefcase, label: 'Platform Activity', href: '/admin/jobs' },
  { icon: AlertTriangle, label: 'Disputes & Complaints', href: '/admin/disputes' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
];

export const DUMMY_ANALYTICS = {
  totalUsers: 12540,
  totalWorkers: 3200,
  activeJobs: 450,
  totalRevenue: '1.2M PKR',
  growthRate: '+12.5%',
  userGrowth: [120, 150, 180, 220, 250, 310, 400], // Last 7 days
  jobTrends: [45, 52, 38, 65, 48, 70, 85],
};

export const DUMMY_USERS = [
  { id: 'U1', name: 'Zainab R.', email: 'zainab.r@example.com', role: 'customer', status: 'active', joinedAt: '2024-01-15' },
  { id: 'U2', name: 'Ahmad Hassan', email: 'ahmad.h@example.com', role: 'worker', status: 'active', joinedAt: '2024-02-10' },
  { id: 'U3', name: 'Usman Khan', email: 'usman.k@example.com', role: 'customer', status: 'suspended', joinedAt: '2023-11-05' },
  { id: 'U4', name: 'Maria S.', email: 'maria.s@example.com', role: 'worker', status: 'pending', joinedAt: '2024-05-01' },
];

export const DUMMY_VERIFICATIONS = [
  { 
    id: 'V1', 
    workerName: 'Ali Raza', 
    category: 'Electrician', 
    submittedAt: '2024-05-02', 
    cnicFront: '/ac_repair.png', 
    cnicBack: '/electrician_image.png',
    status: 'pending'
  },
  { 
    id: 'V2', 
    workerName: 'Sana Ahmed', 
    category: 'Cleaning', 
    submittedAt: '2024-05-01', 
    cnicFront: '/home_cleaning.png', 
    cnicBack: '/window.svg',
    status: 'pending'
  }
];

export const DUMMY_PLATFORM_ACTIVITY = [
  { id: 'J1', title: 'Ceiling Fan Installation', customer: 'Zainab R.', worker: 'Ahmad H.', status: 'in_progress', budget: '2,500 PKR' },
  { id: 'J2', title: 'Kitchen Pipe Leak', customer: 'M. Ibrahim', worker: 'Pending', status: 'bidding', budget: '1,500 PKR' },
  { id: 'J3', title: 'Full House Cleaning', customer: 'Sarah J.', worker: 'Maria S.', status: 'completed', budget: '12,000 PKR' },
];

export const DUMMY_DISPUTES = [
  { 
    id: 'D1', 
    jobId: 'J10', 
    complainant: 'Zainab R.', 
    accused: 'Ali Raza', 
    reason: 'Poor service quality', 
    status: 'open',
    priority: 'high'
  },
  { 
    id: 'D2', 
    jobId: 'J15', 
    complainant: 'Omar K.', 
    accused: 'Usman M.', 
    reason: 'Overcharging', 
    status: 'resolved',
    priority: 'medium'
  }
];
