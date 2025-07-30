const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  designationId: { type: String, required: true, unique: true },
  designationName: { type: String, required: true },
  departmentId: { type: String, required: true },
  level: { type: String },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now }
});

// Update the updatedOn field before saving
designationSchema.pre('save', function(next) {
  this.updatedOn = new Date();
  next();
});

module.exports = mongoose.model('Designation', designationSchema); 