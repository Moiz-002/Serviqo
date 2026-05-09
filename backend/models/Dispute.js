const { Schema, model, Types } = require('mongoose');

const disputeSchema = new Schema({
  job: { type: Types.ObjectId, ref: 'Job', required: true },
  raisedBy: { type: Types.ObjectId, ref: 'User', required: true },
  against: { type: Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['open', 'under-review', 'resolved', 'dismissed'],
    default: 'open',
  },
  resolution: { type: String },
  resolvedBy: { type: Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Dispute = model('Dispute', disputeSchema);

module.exports = Dispute;
