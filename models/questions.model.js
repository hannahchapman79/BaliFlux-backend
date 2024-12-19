const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answers: { type: [String], required: true },
});

const Question = mongoose.model('Question', questionSchema);

const selectQuestions = () => {
  return Question.find()
    .then((questions) => {
      return questions;
    })
}

module.exports = { Question, selectQuestions };