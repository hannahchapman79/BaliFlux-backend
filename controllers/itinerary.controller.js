const { generateItinerary, selectItineraryByUserId } = require("../models/itinerary.model")

exports.postItinerary = async (request, response, next) => {
    try {
        const { userId, answers, isGuest = false } = request.body;

        if (!userId && !isGuest || !answers) {
            return response.status(400).json({ message: 'answers are required and userId is required for non-guest users' });
        }

        const generatedItinerary = await generateItinerary(userId, answers, isGuest);
        response.status(201).send(generatedItinerary);
    } catch (error) {
        next(error);
    }
}

exports.getItineraryByUserId = async (request, response, next) => {
    try {
        const { userId } = request.params;
        if (!userId) {
            return response.status(400).send({ message: 'userId is required' });
        }
        const userItineraries = await selectItineraryByUserId(userId)
        response.status(200).json({ userItineraries })
    } catch (error) {
        next(error)
    }
}