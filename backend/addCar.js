
require('dotenv').config();

const mongoose = require('mongoose');
const Car = require('./models/Car'); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
//Sample
    const newCar = new Car({
      Inventory: 'ccc',
      Vin: '1HGCM82633A004352',
      Year: 2020,
      Make: 'Toyota',
      Model: 'Corolla',
      Trim: 'LE',
      InteriorColor: 'Black',
      ExteriorColor: 'White',
      OdometerValue: 15000,
      OdometerUnits: 'miles',
      Drivetrain: 'FWD',
      TransmissionType: 'Automatic',
      EngineType: 'V4',
      MMR: undefined,
      ConditionReportGrade: undefined,
      SellerName: 'CarMax',
      FacilitationLocation: undefined,
      PickupLocation: undefined,
      StartsAt: new Date(),
      EndsAt: undefined,
      Lane: 'A',
      Run: 'R1',
      BidCount: 5,
      BidAmount: 10000,
      BuyNowPrice: 12000,
      EventSaleName: undefined,
      SellerComments: 'Good condition',
      Status: 'Available',
      Notes: undefined
    });

    return newCar.save();
  })
  .then(() => {
    console.log('Car added successfully');
    mongoose.connection.close();
    console.log('closed');
  })
  .catch((err) => {
    console.error('Error adding car:', err);
  });
