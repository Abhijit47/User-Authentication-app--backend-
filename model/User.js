const mongoose = require('mongoose');

// Define a schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name field should not be empty'],
    minLength: 4,
    maxLength: 30,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'email field should not be empty'],
    unique: true,
    minLength: 10,
    maxLength: 30,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'password field should not be empty'],
    minLength: 8,
    maxLength: 1024,
  },
  created_At: {
    type: Date,
    default: Date.now
  },


});
// }, { versionKey: false });

// middleware

// remove version key in every query
userSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});


// Create a model based on that schema
const User = new mongoose.model('user', userSchema);
module.exports = User;