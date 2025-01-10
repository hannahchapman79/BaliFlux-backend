const express =require("express");
const { postItinerary, getItineraryByUserId } = require("../controllers/itinerary.controller")

const itineraryRouter = express.Router();

itineraryRouter
    .route("/")
    .post(postItinerary)

itineraryRouter
    .route("/:userId")
    .get(getItineraryByUserId)

module.exports = itineraryRouter;