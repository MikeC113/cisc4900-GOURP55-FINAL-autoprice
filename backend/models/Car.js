const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  Inventory: String,
  Vin: String,
  Year: Number,
  Make: String,
  Model: String,
  Trim: String,
  InteriorColor: String,
  ExteriorColor: String,
  OdometerValue: Number,
  OdometerUnits: String,
  Drivetrain: String,
  TransmissionType: String,
  EngineType: String,
  MMR: Number,
  ConditionReportGrade: String,
  SellerName: String,
  FacilitationLocation: String,
  PickupLocation: String,
  StartsAt: Date,
  EndsAt: Date,
  Lane: String,
  Run: String,
  BidCount: Number,
  BidAmount: Number,
  BuyNowPrice: Number,
  EventSaleName: String,
  SellerComments: String,
  Status: String,
  Notes: String
});

module.exports = mongoose.model('Car', carSchema);