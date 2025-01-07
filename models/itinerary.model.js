const mongoose = require('mongoose');
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const itinerarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: String,
  result: String,
  createdAt: { type: Date, default: Date.now }
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

const generateItinerary = async (userId, answers) => {
  try {
    const prompt = `
            Create a travel itinerary for a user visiting Bali based on the following preferences:
            - Interests: ${answers.interests || 'N/A'}
            - Cuisine: ${answers.cuisine || 'N/A'}
            - Vibe: ${answers.vibe || 'N/A'}
            - Nature: ${answers.nature || 'N/A'}
            - Travel Style: ${answers.travelStyle || 'N/A'}
            - Length of trip: ${answers.tripLength || 'N/A'}
            
            Provide a day-by-day breakdown with activity suggestions (not hotel), ensure information is up to date, do not include any recommendations in Kuta or Denpasar.
        `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const result = completion.choices[0]?.message?.content || "No response from AI";

    const newItinerary = new Itinerary({
      userId,
      prompt,
      result
    });
    await newItinerary.save();

    return { userId, result };

  } catch (error) {
    console.error('Error generating itinerary:', error.message || error);
    throw new Error('Failed to generate itinerary');
  }
};

module.exports = { Itinerary, generateItinerary };