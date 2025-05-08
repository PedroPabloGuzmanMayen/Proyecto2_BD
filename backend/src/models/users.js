import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  birthdate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Crear índices
UserSchema.index({ city: 1 });
UserSchema.index({ username: 'text', city: 'text' });

export default mongoose.model('users', UserSchema);
