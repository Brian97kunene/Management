import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  // We use MongoDB's default _id, but you can keep an 'id' field if needed
  name: { type: String, trim: true },
  contact: { type: String, maxLength: 10 },
  contact_name: { type: String },
  email: { type: String, lowercase: true },
  address: { type: String },
  data_format: { type: String }, // e.g., 'CSV', 'JSON', 'API'
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

export const Supplier = mongoose.model('Supplier', supplierSchema);