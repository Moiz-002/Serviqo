const { Schema, model } = require('mongoose');

const portfolioItemSchema = new Schema({
  title: { type: String },
  description: { type: String },
  image: { type: String },
}, { timestamps: true });

const dayAvailabilitySchema = new Schema({
  available: { type: Boolean, default: false },
  from: { type: String, default: '09:00' },
  to: { type: String, default: '17:00' },
}, { _id: false });

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'worker', 'admin'], required: true },
  profilePicture: { type: String },
  city: { type: String },
  address: { type: String },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  otp: { type: String },
  otpExpiry: { type: Date },

  // Worker-specific
  serviceCategory: { type: String },
  skills: [{ type: String }],
  bio: { type: String },
  experience: { type: Number, default: 0 },
  hourlyRate: { type: Number },
  portfolio: [portfolioItemSchema],
  availability: {
    monday: { type: dayAvailabilitySchema, default: () => ({}) },
    tuesday: { type: dayAvailabilitySchema, default: () => ({}) },
    wednesday: { type: dayAvailabilitySchema, default: () => ({}) },
    thursday: { type: dayAvailabilitySchema, default: () => ({}) },
    friday: { type: dayAvailabilitySchema, default: () => ({}) },
    saturday: { type: dayAvailabilitySchema, default: () => ({}) },
    sunday: { type: dayAvailabilitySchema, default: () => ({}) },
  },
  cnicFront: { type: String },
  cnicBack: { type: String },
  cnicVerified: { type: Boolean, default: false },
  cnicRejectionReason: { type: String },
  responseTime: { type: String },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
}, { timestamps: true });

const User = model('User', userSchema);

module.exports = User;
