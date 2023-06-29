const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./model/User');

// Initialize our app with top level express function
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Implementation of CORS
app.use(cors());

// configuration file
dotenv.config({ path: './config.env' });

// Static variable
const MONGO_URL = process.env.DATABASE_URI;
const MONGO_PASSWORD = process.env.DATABASE_PASSWORD;
const PORT = process.env.PORT || 5000;

// connect with DB
const DB = MONGO_URL.replace("<password>", MONGO_PASSWORD);
mongoose.connect(DB)
  .then(() => console.log("Connection successfull ✔"))
  .catch((e) => console.log("Something went wrong in connection ❌"));

/* DEFAULT ROUTE */
app.get('/', (req, res) => {
  res.status(200).json({ message: "Welcome to the Authentication API." });
});

/* REGISTRATION ROUTE */
app.post('/api/v1/register', async (req, res) => {
  // 1. retrive data from body
  const { name, email, password } = req.body;

  // 2. check if user is already exist or not
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    return res.status(400).json({ message: "User is already registerd. Try to login." });
  }

  // 3. hash the password

  // 4. create a user with validation
  try {
    const createUser = await User.create({
      name: name,
      email: email,
      password: password
    });

    // 5. save user 
    const savedUser = await createUser.save();
    if (savedUser) {
      res.status(201).json({ message: "Registration successful", user: savedUser._id });
    }
  } catch (err) {

    const { name, message } = err;
    return res.status(400).json({ name, message });
  }

  // 6. create a token for this user
});

/* LOGIN ROUTE */
app.post('/api/v1/login', async (req, res) => {
  // 1. retrive data from body
  const reqBody = req.body;

  // 2. check if user email is correct or not
  const existCredentials = await User.findOne({ email: reqBody.email });
  if (existCredentials === null) {
    return res.status(404).json({ message: "Email or password wrong!", error: reqBody.email });
  }

  // 3. check if user password is correct or not (hash compare)
  const { password } = await existCredentials;
  if (reqBody.password !== password) {
    return res.status(404).json({ message: "Email or password wrong!" });
  }

  // 4. check auth token and login user

  // 5. send back response to the user
  res.status(200).json({ message: "Login successfully.", user: existCredentials });
});

/* GET USER INFO ROUTE */
app.get('/api/v1/user', async (req, res) => {

  // 1. get the user information
  const user = await User.aggregate()
    .project({ _id: 0, name: 1, email: 1, created_At: 1 })
    .then((result, err) => {
      if (result) {
        res.status(200).json({ message: "success", data: result });
      } else {
        res.status(404).json({ message: "Something went wrong!", error: err.message });
      }
    });

});

/* WILDCARD ROUTE */
app.all('*', (req, res) => {
  res.status(500).json(`Cant ${req.method} on this ${req.originalUrl} URL.`);
});

// Server listen:
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});