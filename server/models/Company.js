const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  country: { type: String, required: true }
});

module.exports = mongoose.model('Company', companySchema); 