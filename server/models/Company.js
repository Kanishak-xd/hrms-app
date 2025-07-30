const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyCode: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  gstNumber: { type: String },
  panNumber: { type: String },
  dateOfIncorporation: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now }
});

// Update the updatedOn field before saving
companySchema.pre('save', function(next) {
  this.updatedOn = new Date();
  next();
});

module.exports = mongoose.model('Company', companySchema); 