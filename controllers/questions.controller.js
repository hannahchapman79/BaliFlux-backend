const { selectQuestions } = require("../models/questions.model")

exports.getQuestions = (request, response, next) => {
    selectQuestions()
        .then((questions) => {
            response.status(200).send({ questions });
        })
        .catch(next);
}

