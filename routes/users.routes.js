const express = require("express");
const { postUser, postLoginAttempt, getUsers, getUserByUsername, deleteUserById } = require("../controllers/users.controller")
const verifyToken = require("../middleware/jwtAuth")

const usersRouter = express.Router();

usersRouter
    .route("/")
    .get(getUsers)
    .post(postUser);

usersRouter
    .route("/login")
    .post(postLoginAttempt);

usersRouter
    .route("/:username")
    .get(getUserByUsername);

usersRouter
    .route("/:user_id")
    .delete(verifyToken, deleteUserById);

module.exports = usersRouter;