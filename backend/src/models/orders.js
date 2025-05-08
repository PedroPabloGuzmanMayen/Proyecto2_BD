import mongoose from 'mongoose';
const OrderDetailSchema = new mongoose.Schema({
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  });
  
  const OrderSchema = new mongoose.Schema({
    detail: [OrderDetailSchema],
    total: {
      type: Number,
      required: true
    },
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, { timestamps: true });

const orders = mongoose.model('orders', OrderSchema);
export default orders;
