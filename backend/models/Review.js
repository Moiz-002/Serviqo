const { Schema, model, Types } = require('mongoose');

const reviewSchema = new Schema({
  job: { type: Types.ObjectId, ref: 'Job', required: true },
  customer: { type: Types.ObjectId, ref: 'User', required: true },
  worker: { type: Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

const Review = model('Review', reviewSchema);

module.exports = Review;
