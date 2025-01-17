const mongoose = require('mongoose');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const itinerarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  result: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

const generateItinerary = async (userId, answers, isGuest = false) => {
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

    const rawResult = completion?.choices?.[0]?.message?.content;

    if (!rawResult) {
      throw new Error('No valid response from AI');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawResult); 
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
    }

    if (!isGuest) {
      const newItinerary = new Itinerary({
        userId,
        prompt,
        result: parsedResult, 
      });
      await newItinerary.save();
    }

    return { userId: isGuest ? 'guest' : userId, result: parsedResult };
  } catch (error) {
    console.error('Error generating itinerary:', error.message || error);
    throw new Error('Failed to generate itinerary');
  }
};

const selectItineraryByUserId = async (userId) => {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid or missing userId');
    }

    const itineraries = await Itinerary.find({ userId });

    if (!itineraries || itineraries.length === 0) {
      throw new Error('No itineraries found for the provided userId');
    }

    return itineraries;
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    throw new Error('Failed to fetch itineraries');
  }
};

module.exports = { Itinerary, generateItinerary, selectItineraryByUserId };