const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answers: { type: [String], required: true },
});

const Question = mongoose.model('Question', questionSchema);

const selectQuestions = (question_id = null) => {
  const query = question_id ? { _id: question_id } : {};

  return Question.find(query).then((questions) => {
    if (!questions || questions.length === 0) {
      throw new Error('No questions found');
    }
    return questions;
  });
};

module.exports = { Question, selectQuestions };