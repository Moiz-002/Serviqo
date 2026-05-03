import { CATEGORIES, CITIES } from './worker-constants';

export const BUDGET_RANGES = [
  { id: 'economy', label: 'Economy', range: '500 - 2,000 PKR', description: 'Small repairs, quick fixes' },
  { id: 'standard', label: 'Standard', range: '2,000 - 10,000 PKR', description: 'Room painting, detailed repairs' },
  { id: 'premium', label: 'Premium', range: '10,000 - 50,000 PKR', description: 'Full house cleaning, solar maintenance' },
  { id: 'custom', label: 'Custom', range: 'Above 50,000 PKR', description: 'Renovations, full wiring' },
];

export const URGENCY_LEVELS = [
  { id: 'emergency', label: 'Emergency', time: 'Within 2 hours', color: 'text-error bg-errorLight' },
  { id: 'today', label: 'Today', time: 'Before evening', color: 'text-amber-600 bg-amber-50' },
  { id: 'scheduled', label: 'Scheduled', time: 'Specific date/time', color: 'text-primary-600 bg-primary-50' },
  { id: 'flexible', label: 'Flexible', time: 'In next 2-3 days', color: 'text-neutral-600 bg-neutral-100' },
];

export const DUMMY_JOBS = [
  {
    id: 'job_001',
    title: 'Ceiling Fan Installation',
    category: 'electrical',
    description: 'I need two ceiling fans installed in my bedrooms. Wiring is already in place, just need to mount and connect.',
    location: { city: 'Islamabad', area: 'F-10/2' },
    budget: 'economy',
    urgency: 'today',
    status: 'open',
    postedAt: '2024-05-01T10:30:00Z',
    images: ['/ac_repair.png'],
    proposalsCount: 5,
  },
  {
    id: 'job_002',
    title: 'Kitchen Pipe Leak Repair',
    category: 'plumbing',
    description: 'The pipe under the kitchen sink is leaking badly. Need urgent repair to prevent water damage to cabinets.',
    location: { city: 'Rawalpindi', area: 'Bahria Phase 7' },
    budget: 'economy',
    urgency: 'emergency',
    status: 'active',
    postedAt: '2024-05-02T08:15:00Z',
    images: ['/plumbing_image.png'],
    proposalsCount: 3,
  },
  {
    id: 'job_003',
    title: 'Full House Deep Cleaning',
    category: 'cleaning',
    description: 'Moving into a new 5-bedroom house. Need professional deep cleaning including windows, floors, and bathrooms.',
    location: { city: 'Lahore', area: 'DHA Phase 6' },
    budget: 'premium',
    urgency: 'scheduled',
    status: 'completed',
    postedAt: '2024-04-28T14:20:00Z',
    images: ['/home_cleaning.png'],
    proposalsCount: 12,
  }
];

export { CATEGORIES, CITIES };
