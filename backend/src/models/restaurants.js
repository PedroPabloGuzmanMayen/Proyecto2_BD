import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
    _id: String,
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
});
  
  const RestaurantSchema = new mongoose.Schema({
    _id: String,
    name: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    city: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    menu: [MenuItemSchema]
}, { timestamps: true });


// Crear índices
RestaurantSchema.index({ "location.coordinates": "2dsphere" });
RestaurantSchema.index({ city: 1, name: 1 });
RestaurantSchema.index({ "menu._id": 1 });
RestaurantSchema.index({ 'menu.name': 1 });

export default mongoose.model('restaurants', RestaurantSchema);
