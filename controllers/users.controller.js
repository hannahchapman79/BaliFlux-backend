const { insertUser, attemptLogin, selectUserByUsername, removeUserById } = require("../models/users.model")

exports.postUser = async (request, response, next) => {
  try {
    const user = request.body;
    const newUser = await insertUser(user);
    response.status(201).send({ user: newUser });
  } catch (error) {
    next(error);
  }
};

exports.getUserByUsername = async (request, response, next) => {
  try {
    const { username } = request.params;
    const user = await selectUserByUsername(username);
    
    if (!user) {
      return response.status(404).send({ message: "User not found" });
    }
    response.status(200).send({ user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUserById = async (request, response, next) => {
  try {
    const { user_id } = request.params;
    await removeUserById(user_id);
    response.status(200).send({ message: "User successfully deleted" });
  } catch (error) {
    next(error);
  }
};

exports.postLoginAttempt = async (request, response, next) => {
  try {
    const loginAttempt = request.body;
    const { user, accessToken, refreshToken } = await attemptLogin(loginAttempt);

    response.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

    response.status(200).json({ user, accessToken });
  } catch (error) {
    next(error);
  }
};