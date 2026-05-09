const { Schema, model, Types } = require('mongoose');

const bidSchema = new Schema({
  job: { type: Types.ObjectId, ref: 'Job', required: true },
  worker: { type: Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  proposal: { type: String, required: true },
  estimatedDays: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

const Bid = model('Bid', bidSchema);

module.exports = Bid;
