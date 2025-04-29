const express = require("express");
const {
  postUser,
  postLoginAttempt,
  getUserByUsername,
  deleteUserById,
  postRefreshToken,
} = require("../controllers/users.controller");
const verifyToken = require("../middleware/jwtAuth");

const usersRouter = express.Router();

usersRouter.route("/").post(postUser);

usersRouter.route("/login").post(postLoginAttempt);

usersRouter.route("/refresh").post(postRefreshToken);

usersRouter.route("/:username").get(getUserByUsername);

usersRouter.route("/id/:user_id").delete(verifyToken, deleteUserById);

module.exports = usersRouter;
