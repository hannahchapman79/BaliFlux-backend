const express = require("express");
const { usersRouter } = require("./routes")
const { getEndpoints } = require("./controllers/endpoints.controller")
const connectMongoDB = require("./db/mongoConnection")
require('dotenv').config();

const app = express();
app.use(express.json());

connectMongoDB();
seedQuestions();

app.get("/api", getEndpoints);
app.use("/api/users", usersRouter);

app.use((error, request, response, next) => {
  if (error.code === "22P02") {
    response.status(400).send({ message: "invalid id type" });
  } else if (error.code === "23503") {
    response.status(404).send({ message: "User not found" });
  } else {
    next(error);
  }
});

app.use((error, request, response, next) => {
  if (error.status && error.message) {
    response.status(error.status).send({ message: error.message });
  } else {
    next(error);
  }
});

app.all("*", (request, response, next) => {
  response.status(404).send({ message: "path not found" });
});

module.exports = app;