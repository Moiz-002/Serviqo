'use client';

import React from 'react';
import { Star, MessageSquare, ThumbsUp, ChevronDown, Filter } from 'lucide-react';
import { DUMMY_REVIEWS, DUMMY_WORKER } from '@/config/worker-constants';

export default function WorkerReviewsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Ratings & Reviews</h1>
          <p className="text-neutral-500 mt-1">See what customers are saying about your work.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-neutral-200 flex items-center gap-2 text-sm font-medium text-neutral-600">
            <Filter className="w-4 h-4" />
            Filter
            <ChevronDown className="w-4 h-4" />
          </div>
          <select className="bg-white px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 outline-none">
            <option>Most Recent</option>
            <option>Highest Rated</option>
            <option>Lowest Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Rating Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm text-center">
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Overall Rating</p>
            <h2 className="text-5xl font-black text-neutral-900 mt-2">{DUMMY_WORKER.rating}</h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`w-5 h-5 ${s <= Math.round(DUMMY_WORKER.rating) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}`} 
                />
              ))}
            </div>
            <p className="text-sm text-neutral-500 mt-4 font-medium">
              Based on {DUMMY_WORKER.totalReviews} reviews
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Rating Breakdown</h3>
            {[5, 4, 3, 2, 1].map((rating) => {
              const percentages = { 5: 85, 4: 10, 3: 3, 2: 1, 1: 1 };
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-neutral-600 w-3">{rating}</span>
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full" 
                      style={{ width: `${percentages[rating]}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-neutral-400 w-8 text-right">{percentages[rating]}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-3 space-y-4">
          {DUMMY_REVIEWS.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:border-primary-200 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">{review.userName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-400">•</span>
                      <span className="text-xs text-neutral-400 font-medium">{review.date}</span>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-neutral-50 rounded-lg border border-neutral-100">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">
                    {review.service}
                  </span>
                </div>
              </div>
              
              <p className="mt-4 text-neutral-700 leading-relaxed italic">
                &quot;{review.comment}&quot;
              </p>

              <div className="mt-6 pt-6 border-t border-neutral-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-primary-600 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-primary-600 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    Reply
                  </button>
                </div>
                <button className="text-xs font-bold text-neutral-400 hover:text-neutral-600">
                  Report
                </button>
              </div>
            </div>
          ))}

          <button className="w-full py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300 transition-all">
            Load More Reviews
          </button>
        </div>
      </div>
    </div>
  );
}
