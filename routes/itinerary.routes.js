const express =require("express");
const { postItinerary, getItineraryByUserId } = require("../controllers/itinerary.controller")
const verifyToken = require("../middleware/jwtAuth")

const itineraryRouter = express.Router();

itineraryRouter
    .route("/")
    .post(postItinerary)

itineraryRouter
    .route("/:userId")
    .get(verifyToken, getItineraryByUserId)

module.exports = itineraryRouter;