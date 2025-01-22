const express = require("express");
const { usersRouter, questionsRouter, itineraryRouter } = require("./routes");
const { getEndpoints } = require("./controllers/endpoints.controller");
const connectMongoDB = require("./db/mongoConnection");
const seedQuestions = require("./db/seeds/seedQuestions");
const dotenv = require("dotenv");

const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

const app = express();
app.use(express.json());

const initializeServer = async () => {
  if (process.env.NODE_ENV !== "test") {
    try {
      await connectMongoDB();
      await seedQuestions();  
    } catch (error) {
      process.exit(1);
    }
  }
};

(async () => {
  try {
      await initializeServer();
  } catch (error) {
      console.error('Server initialization failed:', error);
      process.exit(1);
  }
})();

app.get("/api", getEndpoints);
app.use("/api/users", usersRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/itinerary", itineraryRouter);

app.use((error, request, response, next) => {
  if (error.name === "CastError" && error.kind === "ObjectId") {
    return response.status(400).send({ 
      status: 400,
      message: "Invalid ID format" 
    });
  }

  if (error.code === 11000) {
    return response.status(409).send({ 
      status: 409,
      message: "Resource already exists" 
    });
  }

  if (error.status && error.message) {
    return response.status(error.status).send({ 
      status: error.status,
      message: error.message 
    });
  }

  response.status(500).send({ 
    status: 500,
    message: "Internal server error" 
  });
});

app.all("*", (request, response) => {
  response.status(404).send({ 
    status: 404,
    message: "Path not found" 
  });
});

process.on("SIGINT", () => {
  process.exit(0);
});

module.exports = app;