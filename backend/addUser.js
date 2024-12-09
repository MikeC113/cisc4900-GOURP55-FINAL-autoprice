
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User'); 

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  
  // Create a new user
  const newUser = new User({
    name: 'John C',      
    password: 'password123' 
  });

  // Save the user 
  return newUser.save();
})
.then(() => {
  console.log('User added successfully');
  mongoose.connection.close(); // Close the connection after the user is added
  console.log('Closed');
})
.catch(err => {
  console.error('Error adding user:', err);
});
