const { generateItinerary, selectItineraryByUserId } = require("../models/itinerary.model")

exports.postItinerary = async (request, response, next) => {
    try {
        const { userId, answers } = request.body;

        if (!userId || !answers) {
            return response.status(400).json({ message: 'userId and answers are required' });
        }

        const generatedItinerary = await generateItinerary(userId, answers);
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