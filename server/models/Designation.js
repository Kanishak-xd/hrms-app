const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: Number },
  status: { type: String, enum: ['active', 'inactive'], required: true },
  createdAt: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model('Designation', designationSchema); 