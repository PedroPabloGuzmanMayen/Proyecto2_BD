import mongoose from 'mongoose';
const ReviewSchema = new mongoose.Schema({
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true
    },
    restaurant_id: {
      type: String,
      ref: 'Restaurant',
      required: true
    }
  }, { timestamps: true });
// Indices para reviews

ReviewSchema.index({ restaurant_id: 1, rating: -1 });
ReviewSchema.index({ user_id: 1, rating: 1 });

export default mongoose.model('reviews', ReviewSchema);
