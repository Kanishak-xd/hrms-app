const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "hr", "employee"], default: "employee" },
  fatherName: String, motherName: String, dob: Date, dateOfJoining: Date,
  department: { type: String, required: true },
  designation: { type: String, required: true },
  pfNumber: String, esiNumber: String,
  bankAccount: String, bankName: String, ifscCode: String, grade: String,

  // approval status
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
