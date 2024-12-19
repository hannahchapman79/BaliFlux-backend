const express =require("express");
const { getQuestions } = require("../controllers/questions.controller")

const questionsRouter = express.Router();

questionsRouter
    .route("/")
    .get(getQuestions)


module.exports = questionsRouter;