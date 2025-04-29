const mongoose = require("mongoose");
const { Question } = require("../../models/questions.model");
const questionsData = require("../data/questionsData");

const seedQuestions = async () => {
  try {
    const existingQuestions = await Question.countDocuments();

    if (existingQuestions === 0) {
      await Question.insertMany(questionsData);
      console.log("Questions seeded successfully!");
    } else {
      console.log("Questions already exist. Skipping seeding.");
    }
  } catch (err) {
    console.error("Seeding failed:", err);
  }
};

module.exports = seedQuestions;
