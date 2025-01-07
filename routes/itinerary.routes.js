const express =require("express");
const { postItinerary } = require("../controllers/itinerary.controller")

const itineraryRouter = express.Router();

itineraryRouter
    .route("/")
    .post(postItinerary)

module.exports = itineraryRouter;