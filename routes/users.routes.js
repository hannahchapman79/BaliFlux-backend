const express = require("express");
const { postUser,  postLoginAttempt } = require("../controllers/users.controller")

const usersRouter = express.Router();

usersRouter
    .route("/")
    .post(postUser);

usersRouter
    .route("/login")
    .post(postLoginAttempt);


module.exports = usersRouter;