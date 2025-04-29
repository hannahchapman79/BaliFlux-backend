const { selectQuestions } = require("../models/questions.model");

exports.getQuestions = (request, response, next) => {
  selectQuestions()
    .then((questions) => {
      response.status(200).send({ questions });
    })
    .catch(next);
};

exports.getQuestionById = async (request, response, next) => {
  try {
    const { question_id } = request.params;
    const question = await selectQuestions(question_id);
    if (!question) {
      return response.status(404).send({ message: "Question not found" });
    }
    response.status(200).send({ question });
  } catch (error) {
    next(error);
  }
};
