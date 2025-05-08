import mongoose from 'mongoose';
const OrderDetailSchema = new mongoose.Schema({
    product_id: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  });
  
  const OrderSchema = new mongoose.Schema({
    _id: String,
    detail: [OrderDetailSchema],
    total: {
      type: Number,
      required: true
    },
    restaurant_id: {
      type: String,
      ref: 'Restaurant',
      required: true
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true
    }
  }, { timestamps: true });

// Indices
OrderSchema.index({ 'detail.product_id': 1 }); // multikey
OrderSchema.index({ restaurant_id: 1, total: -1 });

export default mongoose.model('orders', OrderSchema);
