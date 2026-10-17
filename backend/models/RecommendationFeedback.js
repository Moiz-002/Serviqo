const { Schema, model, Types } = require('mongoose');

const recommendationFeedbackSchema = new Schema({
  job: { type: Types.ObjectId, ref: 'Job', required: true },
  customer: { type: Types.ObjectId, ref: 'User', required: true },
  worker: { type: Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true, trim: true },
  helpful: { type: Boolean, required: true },
}, { timestamps: true });

recommendationFeedbackSchema.index({ job: 1, customer: 1, worker: 1 }, { unique: true });
recommendationFeedbackSchema.index({ category: 1, worker: 1, helpful: 1 });

module.exports = model('RecommendationFeedback', recommendationFeedbackSchema);
