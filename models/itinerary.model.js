const mongoose = require("mongoose");
const Groq = require("groq-sdk");

const itinerarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  prompt: { type: String, required: true },
  result: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Itinerary = mongoose.model("Itinerary", itinerarySchema);

const generateItinerary = async (userId, answers, isGuest = false) => {
  const groq = new Groq({ apiKey: process.env["GROQ_API_KEY"] });

  try {
    if (!isGuest && (!userId || typeof userId !== "string")) {
      throw {
        status: 400,
        message: "Invalid or missing userId",
      };
    }

    const prompt = `
  Create a Bali travel itinerary based on the following preferences:
  - Interests: ${answers.interests || "N/A"}
  - Cuisine: ${answers.cuisine || "N/A"}
  - Vibe: ${answers.vibe || "N/A"}
  - Nature: ${answers.nature || "N/A"}
  - Travel Style: ${answers.travelStyle || "N/A"}
  - Length of trip: ${answers.tripLength || "N/A"}
  
  Return the response as a JSON object with the following structure:
  
  {
    "header": "Short, captivating title (max 6 words)",
    "overview": "1-2 sentence trip summary highlighting the experience",
    "days": [
      {
        "dayTitle": "Day 1: Descriptive Title",
        "activities": [
          {
            "title": "Natural-sounding activity title (e.g., 'Dinner at Locavore', 'Relax at Balangan Beach')",
            "description": "1-2 sentence activity summary",
            "details": {
              "cost": "e.g., $20, Free",
              "duration": "e.g., 2 hours",
              "notes": "e.g., Best visited in the morning"
            },
            "imagePlace": "Short, hyphenated keyword matching the main location or venue (e.g., 'locavore', 'balangan-beach', 'uluwatu-temple', 'seniman-coffee'). Do not include verbs like 'visit' or 'dinner at'. Only use the place or establishment name."
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
            },
            "imagePlace": "Short, hyphenated keyword matching the main location or venue."
          }
        ]
      }
    ]
  }
  
  Constraints:
  - Locations to avoid: Kuta, Nusa Dua, Denpasar.
  - Only include Sanur if the vibe stated is family-friendly.
  
  Preferred areas:
  - If beaches are stated: prioritize Nusa Penida, Uluwatu, or Nusa Lembongan.
  - If waterfalls are stated: prioritize Leke Leke Waterfall, Gembleng Waterfall, Tukad Cepung Waterfall, or Nungnung Waterfall.
  - If unique dining is stated: prioritize recommending "The Cave" (Uluwatu), "Koral Restaurant - The Apurva Kempinski Bali" (Nusa Dua), Sa'Mesa (Canggu), Merlins (Ubud), and Gajah Putih (Ubud).
  
  Important Requirements:
  1. All locations must be real, verifiable places in Bali (2024).
  2. Consider typical Bali traffic in travel times.
  3. Ensure logical geographic progression between activities.
  4. Use current (2024) prices.
  5. Include only currently operating establishments.
  6. Ensure realistic timing between activities.
  7. Maximum travel time per day: 3 hours.
  
  Please generate a logistically sound, realistic itinerary following these specifications and format requirements.
  `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const rawResult = completion?.choices?.[0]?.message?.content;

    if (!rawResult) {
      throw {
        status: 500,
        message: "No valid response received from AI service",
      };
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawResult);
    } catch (parseError) {
      throw {
        status: 500,
        message: "Failed to parse AI response into valid JSON",
      };
    }

    if (!isGuest) {
      const newItinerary = new Itinerary({
        userId,
        prompt,
        result: parsedResult,
      });
      await newItinerary.save();
    }

    return { userId: isGuest ? "guest" : userId, result: parsedResult };
  } catch (error) {
    throw {
      status: 500,
      message: "Failed to generate itinerary",
      error: error.message,
    };
  }
};

const selectItineraryByUserId = async (userId) => {
  try {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      throw {
        status: 400,
        message: "Invalid or missing userId",
      };
    }

    const itineraries = await Itinerary.find({ userId });

    if (!itineraries || itineraries.length === 0) {
      throw {
        status: 404,
        message: "No itineraries found for the provided userId",
      };
    }

    return itineraries;
  } catch (error) {
    throw {
      status: 500,
      message: "Failed to fetch itineraries",
    };
  }
};

module.exports = { Itinerary, generateItinerary, selectItineraryByUserId };
