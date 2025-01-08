const mongoose = require('mongoose');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const itinerarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  result: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

const generateItinerary = async (userId, answers) => {
  try {
    const prompt = `
      Create a Bali travel itinerary based on the following preferences:
      - Interests: ${answers.interests || 'N/A'}
      - Cuisine: ${answers.cuisine || 'N/A'}
      - Vibe: ${answers.vibe || 'N/A'}
      - Nature: ${answers.nature || 'N/A'}
      - Travel Style: ${answers.travelStyle || 'N/A'}
      - Length of trip: ${answers.tripLength || 'N/A'}
    
      Return the response as a JSON object with the following structure:

      {
        "header": "Short, captivating title (max 6 words)",
        "overview": "1-2 sentence trip summary highlighting the experience",
        "days": [
          {
            "dayTitle": "Day 1: Descriptive Title",
            "activities": [
              {
                "title": "Activity Name",
                "description": "1-2 sentence activity summary",
                "details": {
                  "cost": "e.g., $20, Free",
                  "duration": "e.g., 2 hours",
                  "notes": "e.g., Best visited in the morning"
                }
              }
            ]
          },
          {
            "dayTitle": "Day 2: Descriptive Title",
            "activities": [
              {
                "title": "Activity Name",
                "description": "1-2 sentence activity summary",
                "details": {
                  "cost": "e.g., $50",
                  "duration": "e.g., Half-day",
                  "notes": "Bring sunscreen"
                }
              }
            ]
          }
        ]
      }

      Guidelines:
      - Keep text concise and scannable.
      - Avoid recommendations in Kuta or Denpasar.
      - Ensure up-to-date, relevant suggestions.
      - Maintain a professional but friendly tone.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const result = completion?.choices?.[0]?.message?.content;
    if (!result) {
      throw new Error('No valid response from AI');
    }

    const newItinerary = new Itinerary({
      userId,
      prompt,
      result,
    });
    await newItinerary.save();

    return { userId, result };
  } catch (error) {
    console.error('Error generating itinerary:', error.message || error);
    throw new Error('Failed to generate itinerary');
  }
};

module.exports = { Itinerary, generateItinerary };