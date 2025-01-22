const { insertUser, attemptLogin, selectUsers, selectUserByUsername, removeUserById } = require("../models/users.model")

exports.postUser = async (request, response, next) => {
  try {
    const user = request.body;
    const newUser = await insertUser(user);
    response.status(201).send({ user: newUser });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (request, response, next) => {
  try {
    const users = await selectUsers();
    response.status(200).send({ users });
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
    const userResponse = await attemptLogin(loginAttempt);
    response.status(200).send(userResponse);
  } catch (error) {
    next(error);
  }
};