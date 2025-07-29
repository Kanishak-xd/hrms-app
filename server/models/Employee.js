const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dob: { type: Date },
  joiningDate: { type: Date, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  address: { type: String },
  profilePicUrl: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'onboarding', 'resigned'], required: true },
  createdAt: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model('Employee', employeeSchema); 