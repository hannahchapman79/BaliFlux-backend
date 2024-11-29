const db = require("../db/connection");
const { checkUserExists } = require("../utils");
const bcrypt = require("bcrypt");

const saltRounds = 13; 

exports.insertUser = async (newUser) => {
  if (!newUser.username || !newUser.password || !newUser.email) {
    return Promise.reject({
      status: 400,
      message: "All fields are required (username, password, email)",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newUser.email)) {
    return Promise.reject({
      status: 400,
      message: "Invalid email format",
    });
  }

  if (newUser.password.length < 8) {
    return Promise.reject({
      status: 400,
      message: "Password must be at least 8 characters long",
    });
  }

  const conflicts = await checkUserExists(newUser.username, newUser.email);

  if (conflicts.username && conflicts.email) {
    return Promise.reject({
      status: 400,
      message: "User already exists",
    });
  } else if (conflicts.username) {
    return Promise.reject({
      status: 400,
      message: "Username already exists",
    });
  } else if (conflicts.email) {
    return Promise.reject({
      status: 400,
      message: "Email already exists",
    });
  }

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);
    const { rows } = await db.query(
      `INSERT INTO users
            (username, password, email)
            VALUES ($1, $2, $3)
            RETURNING *`,
      [newUser.username, hashedPassword, newUser.email]
    );

    return rows[0];
  } catch (error) {
    throw { status: 500, message: "Internal server error" };
  }
}