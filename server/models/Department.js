const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], required: true },
  createdAt: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model('Department', departmentSchema); 