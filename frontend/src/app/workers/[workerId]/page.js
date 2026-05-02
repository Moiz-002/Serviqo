'use client';
import Image from 'next/image';
import {
  MapPin,
  Star,
  Clock,
  Shield,
  MessageSquare,
  Bookmark,
  Share2,
  Award,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

// Mock worker data
const mockWorker = {
  id: '1',
  name: 'Ahmad Hassan',
  firstName: 'Ahmad',
  role: 'Verified Electrician',
  city: 'F-7, Islamabad',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  bio: 'I&apos;m a certified electrician with 6 years of experience in residential and commercial electrical work. I specialize in home automation, solar installations, and troubleshooting complex electrical issues. I&apos;m committed to providing safe, high-quality work and excellent customer service.',
  rating: 4.9,
  reviewCount: 127,
  jobsCompleted: 127,
  experience: '3 yrs exp.',
  responseTime: '~30 min response',
  available: true,
  hourlyRate: 1500,
  category: 'Electrical',
  skills: [
    'Circuit breaker repair',
    'LED installation',
    'Inverter wiring',
    'CCTV installation',
    'Solar panel wiring',
    'Generator maintenance',
  ],
  certifications: [
    {
      title: 'WAPDA Certified Electrician',
      issuedBy: 'Technical Education & Vocational Training Authority',
      year: 2021,
    },
    {
      title: 'Solar Installation Specialist',
      issuedBy: 'Renewable Energy Institute Pakistan',
      year: 2022,
    },
  ],
  portfolio: [
    {
      url: 'https://images.unsplash.com/photo-1621905167918-48416bd8575a?w=400&h=400&fit=crop',
      caption: 'LED ceiling installation in modern home',
    },
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      caption: 'Solar panel wiring setup',
    },
    {
      url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=400&fit=crop',
      caption: 'Home automation control panel installation',
    },
    {
      url: 'https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=400&h=400&fit=crop',
      caption: 'Backup power system implementation',
    },
  ],
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  workingHours: '9:00 AM – 6:00 PM',
  responseTimeText: 'Typically responds within 1 hour',
  serviceRadius: '30 km radius',
  reviews: [
    {
      id: '1',
      author: 'Fatima Khan',
      role: 'Homeowner',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      rating: 5,
      date: '2 weeks ago',
      text: 'Ahmad was professional, quick, and did excellent work on my home automation setup. He explained everything clearly and finished on time. Highly recommended!',
      helpful: 24,
      unhelpful: 0,
    },
    {
      id: '2',
      author: 'Ali Raza',
      role: 'Business Owner',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rating: 5,
      date: '1 month ago',
      text: 'Requested Ahmad for our office electrical upgrade. He provided detailed quotation, worked efficiently, and completed the project within budget and timeline. Very reliable!',
      helpful: 18,
      unhelpful: 1,
    },
    {
      id: '3',
      author: 'Sarah Ahmed',
      role: 'Homeowner',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      rating: 4,
      date: '1.5 months ago',
      text: 'Great electrician! Fixed our inverter issue quickly. Only minor note: couldn&apos;t make it on the first scheduled date due to emergency job, but informed us early.',
      helpful: 12,
      unhelpful: 0,
    },
  ],
  ratingDistribution: {
    5: 85,
    4: 10,
    3: 3,
    2: 1,
    1: 1,
  },
};

const ReviewBars = () => {
  'use client';
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((stars) => (
        <div key={stars} className="flex items-center gap-3">
          <span className="text-sm text-text-secondary w-12">{stars}★</span>
          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-700 ease-out"
              style={{
                width: `${mockWorker.ratingDistribution[stars]}%`,
              }}
            />
          </div>
          <span className="text-xs text-text-tertiary w-8">
            {mockWorker.ratingDistribution[stars]}%
          </span>
        </div>
      ))}
    </div>
  );
};

const PortfolioLightbox = ({ images, initialIndex = 0 }) => {
  'use client';
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsOpen(true);
            }}
            className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
          >
            <Image
              src={image.url}
              alt={image.caption || `Portfolio ${index + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
            if (e.key === 'ArrowLeft')
              setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
            if (e.key === 'ArrowRight')
              setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio image viewer"
        >
          <div className="relative max-w-3xl max-h-screen w-full h-full flex items-center justify-center">
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].caption || `Portfolio ${currentIndex + 1}`}
              fill
              className="object-contain"
            />

            {/* Caption */}
            {images[currentIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 text-center text-sm">
                {images[currentIndex].caption}
              </div>
            )}

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Previous image"
                >
                  ← 
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import { useState } from 'react';

export default function WorkerProfilePage({ params }) {
  const workerId = params.workerId;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
            strokeWidth={0}
          />
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-yellow-400" strokeWidth={0} />
            <div className="absolute inset-0 w-1/2 bg-yellow-400 overflow-hidden">
              <Star className="w-4 h-4 fill-yellow-400" strokeWidth={0} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 text-gray-300"
            strokeWidth={0}
          />
        );
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Profile Header Card */}
        <div className="bg-surface rounded-3xl shadow-md p-6 md:p-8 mb-8">
          <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
            {/* Avatar */}
            <div className="relative w-24 md:w-32 h-24 md:h-32 flex-shrink-0">
              <Image
                src={mockWorker.avatar}
                alt={mockWorker.name}
                fill
                className="rounded-full object-cover border-4 border-accent"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 md:w-7 md:h-7 bg-accent rounded-full border-2 border-surface flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                {mockWorker.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="px-3 py-1 bg-primary-light text-primary rounded-full text-xs font-semibold uppercase">
                  {mockWorker.role}
                </div>
                <div className="flex items-center gap-1 text-sm text-text-secondary">
                  <MapPin className="w-4 h-4 text-accent" strokeWidth={2} />
                  {mockWorker.city}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex gap-0.5">
                  {renderStars(mockWorker.rating)}
                </div>
                <span className="font-bold text-text-primary">{mockWorker.rating}</span>
                <span className="text-sm text-text-secondary">
                  ({mockWorker.reviewCount} reviews)
                </span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-4 text-sm">
                <div>
                  <p className="font-bold text-text-primary">{mockWorker.jobsCompleted}</p>
                  <p className="text-text-tertiary text-xs">Jobs Completed</p>
                </div>
                <div className="border-l border-border"></div>
                <div>
                  <p className="font-bold text-text-primary">{mockWorker.experience}</p>
                  <p className="text-text-tertiary text-xs">Experience</p>
                </div>
                <div className="border-l border-border"></div>
                <div>
                  <p className="font-bold text-text-primary">{mockWorker.responseTime}</p>
                  <p className="text-text-tertiary text-xs">Response Time</p>
                </div>
              </div>

              {/* Availability Badge */}
              <div className="flex items-center gap-2 mt-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    mockWorker.available ? 'bg-success animate-pulse' : 'bg-text-tertiary'
                  }`}
                />
                <span className="text-sm font-medium text-text-secondary">
                  {mockWorker.available ? 'Available Today' : 'Next available: Tomorrow'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-6 md:col-span-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-hover transition-colors">
                Request a Quote
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
              <button className="px-4 py-3 border border-border text-text-primary rounded-full hover:bg-surface transition-colors">
                <Bookmark className="w-4 h-4" strokeWidth={2} />
              </button>
              <button className="px-4 py-3 border border-border text-text-primary rounded-full hover:bg-surface transition-colors">
                <Share2 className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="bg-surface rounded-3xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            About {mockWorker.firstName}
          </h2>
          <p className="text-text-secondary leading-relaxed text-base">
            {mockWorker.bio}
          </p>
        </section>

        {/* Skills & Expertise */}
        <section className="bg-surface rounded-3xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Skills &amp; Expertise
          </h2>

          <div className="mb-6">
            <div className="inline-block px-4 py-2 bg-primary-light text-primary rounded-full text-sm font-semibold uppercase">
              {mockWorker.category}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase text-text-secondary mb-3">
              Specific Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {mockWorker.skills.map((skill) => (
                <div
                  key={skill}
                  className="px-3 py-1.5 bg-surface border border-border text-text-primary rounded-full text-sm"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {mockWorker.certifications.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-text-secondary mb-3">
                Certifications
              </p>
              <div className="space-y-2">
                {mockWorker.certifications.map((cert) => (
                  <div key={cert.title} className="flex gap-2 text-sm">
                    <Award className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-text-primary">{cert.title}</p>
                      <p className="text-xs text-text-tertiary">
                        {cert.issuedBy} • {cert.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Portfolio */}
        {mockWorker.portfolio.length > 0 && (
          <section className="bg-surface rounded-3xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Portfolio
            </h2>
            <PortfolioLightbox images={mockWorker.portfolio} />
          </section>
        )}

        {/* Working Hours */}
        <section className="bg-surface rounded-3xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Availability
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-text-secondary mb-2">
                Working Days
              </p>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div
                    key={day}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      mockWorker.workingDays.includes(day)
                        ? 'bg-accent-light text-accent border border-accent'
                        : 'bg-surface text-text-disabled border border-border line-through'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-5 h-5 text-accent" strokeWidth={2} />
              <div>
                <span className="font-semibold text-text-primary">
                  {mockWorker.workingHours}
                </span>
                <p className="text-xs text-text-tertiary">Standard working hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <TrendingUp className="w-5 h-5 text-accent" strokeWidth={2} />
              <span className="text-text-secondary">{mockWorker.responseTimeText}</span>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="bg-surface rounded-3xl shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Customer Reviews
            </h2>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Rating Summary */}
              <div className="md:w-48">
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-text-primary">
                    {mockWorker.rating}
                  </span>
                  <div className="flex gap-0.5">
                    {renderStars(mockWorker.rating)}
                  </div>
                </div>
                <p className="text-sm text-text-secondary">
                  Based on {mockWorker.reviewCount} reviews
                </p>
              </div>

              {/* Rating Bars */}
              <div className="flex-1">
                <ReviewBars />
              </div>
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-4">
            {mockWorker.reviews.map((review) => (
              <div
                key={review.id}
                className="border border-border rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={review.avatar}
                      alt={review.author}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-text-primary">
                        {review.author}
                      </p>
                      <p className="text-xs text-text-tertiary">{review.role}</p>
                    </div>
                  </div>
                  <span className="text-xs text-text-tertiary">{review.date}</span>
                </div>

                <div className="flex gap-0.5 mb-3">
                  {renderStars(review.rating)}
                </div>

                <p className="text-sm text-text-secondary mb-4">
                  {review.text}
                </p>

                <div className="flex items-center gap-4 text-xs">
                  <button className="flex items-center gap-1 text-text-tertiary hover:text-text-secondary">
                    <ThumbsUp className="w-3.5 h-3.5" strokeWidth={2} />
                    Helpful ({review.helpful})
                  </button>
                  <button className="flex items-center gap-1 text-text-tertiary hover:text-text-secondary">
                    <ThumbsDown className="w-3.5 h-3.5" strokeWidth={2} />
                    ({review.unhelpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

import { ArrowRight } from 'lucide-react';
