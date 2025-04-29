const express = require("express");
const {
  getQuestions,
  getQuestionById,
} = require("../controllers/questions.controller");

const questionsRouter = express.Router();

questionsRouter.route("/").get(getQuestions);

questionsRouter.route("/:question_id").get(getQuestionById);

module.exports = questionsRouter;
