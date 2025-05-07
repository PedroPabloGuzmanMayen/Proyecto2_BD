
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    }
  }, { timestamps: true });
  
  // Crear índices
  ReviewSchema.index({ restaurant_id: 1 });
  ReviewSchema.index({ user_id: 1, rating: -1 });
  
  module.exports = mongoose.model('Review', ReviewSchema);