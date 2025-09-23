const mongoose = require('mongoose');

// Define Address Subschema
const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },      // Street Address
  line2: { type: String },                      // Street Address 2 (Optional)
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
});

// Define Customer Schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },   // Store hashed password
  address: { type: addressSchema, required: true },
  nicIdImage: { type: String, required: true }, // File path for NIC ID image
  addressVerificationDoc: { type: String, required: true }, // File path for address verification document
  status: { type: String, enum: ['Pending Approval', 'Approved', 'Rejected'], default: 'Pending Approval' }, // Registration status
  // 🔒 Add these fields
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});
// 🔒 Virtual helper
customerSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Create and export the Customer model
module.exports = mongoose.model('Customer', customerSchema);
