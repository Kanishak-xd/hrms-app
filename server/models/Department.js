const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentId: { type: String, required: true, unique: true },
  departmentName: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now }
});

// Update the updatedOn field before saving
departmentSchema.pre('save', function(next) {
  this.updatedOn = new Date();
  next();
});

module.exports = mongoose.model('Department', departmentSchema); 