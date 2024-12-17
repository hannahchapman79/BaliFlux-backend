const mongoose = require("mongoose");
const connectMongoDB = require("../mongoConnection")
const questions = require("../../models/questions");
const questionsData = require("../data/questionsData");

const seedQuestions = async () => {
  try {
    if (process.env.NODE_ENV === "production") {
      console.log("Seeding skipped in production.");
      return;
    }

    await connectMongoDB();
    await questions.deleteMany(); 
    await questions.insertMany(questionsData);

    console.log("Questions seeded successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedQuestions();