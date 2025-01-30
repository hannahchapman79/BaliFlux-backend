const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const User = mongoose.model('User', userSchema);

const checkUserExists = async (username, email) => {
  const existingUsername = await User.findOne({ username });
  const existingEmail = await User.findOne({ email });
  
  return {
    username: !!existingUsername,
    email: !!existingEmail
  };
};

exports.insertUser = async (newUser) => {

  if (!newUser.username || !newUser.password || !newUser.email) {
    throw { status: 400, message: "All fields are required (username, password, email)" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newUser.email)) {
    throw { status: 400, message: "Invalid email format" };
  }

  if (newUser.password.length < 8) {
    throw { status: 400, message: "Password must be at least 8 characters long" };
  }

  const conflicts = await checkUserExists(newUser.username, newUser.email);
  if (conflicts.username && conflicts.email) {
    throw { status: 400, message: "User already exists" };
  } else if (conflicts.username) {
    throw { status: 400, message: "Username already exists" };
  } else if (conflicts.email) {
    throw { status: 400, message: "Email already exists" };
  }

  const hashedPassword = await bcrypt.hash(newUser.password, 13);
  const user = new User({
    username: newUser.username,
    password: hashedPassword,
    email: newUser.email
  });

  const savedUser = await user.save();
  return {
    user_id: savedUser._id,
    username: savedUser.username,
    email: savedUser.email
  };
};


exports.attemptLogin = async (loginAttempt) => {
  if (!loginAttempt.email || !loginAttempt.password) {
    throw { status: 400, message: "All fields are required (email, password)" };
  }

  const user = await User.findOne({ email: loginAttempt.email });
  if (!user) {
    throw { status: 400, message: "Bad email or password" };
  }

  const isMatch = await bcrypt.compare(loginAttempt.password, user.password);
  if (!isMatch) {
    throw { status: 400, message: "Bad email or password" };
  }

  const accessToken = jwt.sign(
    { user_id: user._id, username: user.username, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15min" }
  );

  const refreshToken = jwt.sign(
    { username: user.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );

  return {
    user: {
      user_id: user._id,
      username: user.username,
      email: user.email,
    },
    accessToken,
    refreshToken, 
  };
};

exports.selectUserByUsername = async (username) => {
  const user = await User.findOne({ username }, { password: 0 });
  if (!user) return null;
  
  return {
    user_id: user._id,
    username: user.username,
    email: user.email
  };
};

exports.removeUserById = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw { status: 404, message: "user does not exist" };
  }
  return user;
};

module.exports = {
  User,
  insertUser: exports.insertUser,
  attemptLogin: exports.attemptLogin,
  selectUserByUsername: exports.selectUserByUsername,
  removeUserById: exports.removeUserById
};