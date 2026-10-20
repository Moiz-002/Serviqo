const { Schema, model, Types } = require('mongoose');

const recommendationInviteSchema = new Schema({
  job: { type: Types.ObjectId, ref: 'Job', required: true },
  customer: { type: Types.ObjectId, ref: 'User', required: true },
  worker: { type: Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

recommendationInviteSchema.index({ job: 1, worker: 1 }, { unique: true });

module.exports = model('RecommendationInvite', recommendationInviteSchema);
