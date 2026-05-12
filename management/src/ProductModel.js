import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    

  sku: { type: String, required: true, unique: true },
    name: { type: String, required: true, default: function() { return `Product-${this.sku}`; } } ,
  
  // FIXED STOCK: For items that are simple
  quantity: { type: Number, default: 0 },

  // FLEXIBLE STOCK: An object that can hold anything
  // This is where your "changes in business logic" live
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
    },


   

  // DYNAMIC ATTRIBUTES: Useful for different supplier requirements
  

}, { timestamps: true, strict: false });

export const Product = mongoose.model('Product', productSchema);


