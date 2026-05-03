export const CATEGORIES = [
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Wiring, fixtures, panels, repairs',
    icon: '⚡',
    skills: [
      'Circuit breaker repair',
      'LED installation',
      'Inverter wiring',
      'CCTV installation',
      'Solar panel wiring',
      'Generator maintenance',
      'Ceiling fan installation',
      'Electrical troubleshooting',
      'Home automation setup',
      'Backup power systems',
    ],
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Pipes, leaks, installation, drainage',
    icon: '🔧',
    skills: [
      'Pipe fitting',
      'Leak detection',
      'Water heater installation',
      'Bathroom fitting',
      'Drainage cleaning',
      'Tap replacement',
      'Sewer line repair',
      'Water pressure regulation',
      'Geyser installation',
      'Underground pipe work',
    ],
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    description: 'Furniture, cabinets, woodwork, repairs',
    icon: '🪵',
    skills: [
      'Furniture assembly',
      'Custom cabinet making',
      'Door installation',
      'Wooden flooring',
      'Shelving design',
      'Bed frame construction',
      'Wood finishing',
      'Repair restoration',
      'Deck building',
      'Interior woodwork',
    ],
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    description: 'Deep clean, routine, commercial, move-in/out',
    icon: '🧹',
    skills: [
      'Deep cleaning',
      'Routine maintenance',
      'Carpet cleaning',
      'Window cleaning',
      'Post-construction cleanup',
      'Move-in/out cleaning',
      'Commercial cleaning',
      'Stain removal',
      'Upholstery cleaning',
      'Pressure washing',
    ],
  },
  {
    id: 'appliance',
    name: 'Appliance Repair',
    description: 'AC, washing machine, fridge, microwave',
    icon: '📱',
    skills: [
      'Washing machine repair',
      'Refrigerator repair',
      'Microwave repair',
      'Dishwasher repair',
      'Oven repair',
      'Dryer repair',
      'Water dispenser maintenance',
      'Appliance diagnostics',
      'Parts replacement',
      'Electrical troubleshooting',
    ],
  },
  {
    id: 'hvac',
    name: 'AC & HVAC',
    description: 'Installation, servicing, gas refill, maintenance',
    icon: '❄️',
    skills: [
      'AC installation',
      'AC servicing',
      'Gas refill',
      'Compressor repair',
      'Ductwork installation',
      'Thermostat setup',
      'Preventive maintenance',
      'Refrigerant charging',
      'Condenser cleaning',
      'Air quality assessment',
    ],
  },
];

export const CITIES = [
  'Islamabad',
  'Rawalpindi',
  'Lahore',
  'Karachi',
  'Peshawar',
  'Faisalabad',
  'Multan',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
];

export const RESPONSE_TIMES = [
  'Within 1 hour',
  'Within 4 hours',
  'Same day',
  'Within 24 hours',
];

export const SERVICE_RADIUS_OPTIONS = ['5 km', '10 km', '20 km', '30 km', '50+ km'];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const HOURS = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${String(display).padStart(2, '0')}:00 ${ampm}`;
});

export const DUMMY_WORKER = {
  id: 'worker_123',
  displayName: 'Ahmad Hassan',
  email: 'ahmad.hassan@example.com',
  phone: '+92 300 1234567',
  avatar: '/profile_1.png',
  bio: 'Expert electrician with over 8 years of experience in residential and commercial wiring. Specializing in smart home automation and solar panel installations. Committed to providing safe, reliable, and efficient electrical solutions.',
  city: 'Islamabad',
  area: 'DHA Phase 2',
  yearsExperience: '8',
  primaryCategory: 'electrical',
  skills: ['Circuit breaker repair', 'LED installation', 'Inverter wiring', 'Solar panel wiring', 'Smart home automation'],
  certifications: [
    { title: 'Licensed Electrician', issuedBy: 'IESCO', year: 2018 },
    { title: 'Solar Technician Certification', issuedBy: 'PVA Pakistan', year: 2020 }
  ],
  hourlyRate: '1800',
  serviceRadius: '20 km',
  portfolioItems: [
    { id: 1, preview: '/ac_repair.png', caption: 'Complete rewiring of a 1-kanal house' },
    { id: 2, preview: '/electrician_image.png', caption: 'Solar panel installation for office' },
    { id: 3, preview: '/application_repair.png', caption: 'Industrial panel maintenance' }
  ],
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  startTime: '09:00 AM',
  endTime: '06:00 PM',
  instantBooking: true,
  responseTime: 'Within 1 hour',
  rating: 4.8,
  totalReviews: 154,
  completedJobs: 210,
  onboardingCompleted: true,
};

export const DUMMY_REVIEWS = [
  {
    id: 1,
    userName: 'Zainab R.',
    rating: 5,
    comment: 'Ahmad did an excellent job with our solar panel installation. Very professional and explained everything clearly.',
    date: '2024-04-20',
    service: 'Solar Installation',
  },
  {
    id: 2,
    userName: 'Usman K.',
    rating: 4,
    comment: 'Good work, was on time. Fixed the circuit breaker issue quickly.',
    date: '2024-04-15',
    service: 'Electrical Repair',
  },
  {
    id: 3,
    userName: 'Maria S.',
    rating: 5,
    comment: 'Highly recommended! Very polite and knowledgeable about smart home setups.',
    date: '2024-03-10',
    service: 'Home Automation',
  }
];
