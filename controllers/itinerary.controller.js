const { generateItinerary } = require("../models/itinerary.model")

exports.postItinerary = async (request, response, next) => {
    try {
        const { userId, answers } = request.body;

        if (!userId || !answers) {
            return response.status(400).json({ message: 'userId and answers are required' });
        }

        const generatedItinerary = await generateItinerary(userId, answers);
        response.status(201).json(generatedItinerary);
    } catch (error) {
        next(error); 
    }
}