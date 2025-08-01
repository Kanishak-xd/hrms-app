const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "hr", "employee"], default: "employee" },
  fatherName: String, motherName: String, dob: Date, dateOfJoining: Date,
  department: { type: String, required: false }, // Made optional
  designation: { type: String, required: false }, // Made optional
  pfNumber: String, esiNumber: String,
  bankAccount: String, bankName: String, ifscCode: String, grade: String,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
