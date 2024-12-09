const express = require("express");
const { postUser, postLoginAttempt, getUsers, getUserByUsername } = require("../controllers/users.controller")

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

module.exports = usersRouter;