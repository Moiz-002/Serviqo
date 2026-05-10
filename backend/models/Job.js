const { Schema, model, Types } = require('mongoose');

const jobSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budgetRange: { type: String, required: true },
  urgency: { type: String, required: true },
  location: {
    city: { type: String, required: true },
    area: { type: String },
  },
  status: {
    type: String,
    enum: ['open', 'active', 'completed', 'cancelled'],
    default: 'open',
  },
  customer: { type: Types.ObjectId, ref: 'User', required: true },
  assignedWorker: { type: Types.ObjectId, ref: 'User' },
  acceptedBid: { type: Types.ObjectId, ref: 'Bid' },
  images: [{ type: String }],
  totalBids: { type: Number, default: 0 },
}, { timestamps: true });

jobSchema.index({ customer: 1 });

const Job = model('Job', jobSchema);

module.exports = Job;
