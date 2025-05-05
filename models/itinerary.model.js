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
Create a Bali travel itinerary based on the user's preferences below:

- Interests: ${answers.interests || "N/A"}
- Cuisine: ${answers.cuisine || "N/A"}
- Nature: ${answers.nature || "N/A"}
- Length of trip: ${answers.tripLength || "N/A"}

Important Requirements (Must Follow):

1. Each day's activities must be located within the **same general area of Bali**:
   e.g., Uluwatu, Canggu, Ubud, Seminyak, Sanur, Nusa Penida, Nusa Lembongan, or Bedugul.
   **Do not mix areas** like Uluwatu and Canggu on the same day.

2. CRITICAL: Plan the itinerary with **logical geographical progression**:
   - Group consecutive days in the **same region** with a **minimum 3-night stay** per location
   - Organize the trip to minimize travel time between regions
   - Example: Days 1-3 in Ubud, then Days 4-6 in Canggu, then Days 7-9 in Uluwatu
   - AVOID illogical patterns like: Day 1 Ubud, Day 2 Uluwatu, Day 3 back to Ubud

3. Respect Bali traffic conditions. Assume:
   - Uluwatu ↔ Canggu = 1.5+ hours (schedule transition days between regions)
   - Ubud ↔ Seminyak = 1.5 hours
   - Max travel time per day: 30 to 60 mins between activities.
   - Plan **one transition day** when moving between major regions

4. Only include **currently operating** and **verifiable** Bali locations (as of 2024).
5. Include **realistic timing** for the day and ensure activities are logistically possible.
6. Max 2 activities per day, ideally **morning and afternoon**.
7. Avoid: Kuta, Denpasar, Nusa Dua (unless family-friendly vibe is stated).

---

Preferred Content (Based on Inputs):

If user mentions:

- **Beaches** → Prioritise: Nusa Penida, Uluwatu, Nusa Lembongan
- **Waterfalls** → Prioritise: Leke Leke (Ubud), Tukad Cepung (Ubud), Gembleng (Sideman), Nungnung (Ubud)
- **Unique dining** → Suggest: The Cave (Uluwatu), Koral Restaurant (Nusa Dua), Sa'Mesa (Canggu), Merlins (Ubud), Gajah Putih (Ubud)
- **Nightlife** → Suggest: La Brisa (Canggu), The Lawn (Canggu), Savaya (Uluwatu), Single Fin (Uluwatu), Motel Mexicola (Canggu)
- **Fitness** → Suggest: Bambu Fitness (Uluwatu), Nirvana (Canggu), The Yoga Barn (Ubud)
- **Brunch** → Suggest: Crate Café (Canggu), Copenhagen (Canggu), Shady Shack (Canggu), The Loft (Uluwatu), Nourish (Uluwatu), Alchemy (Ubud) — Add "brunch" in \`imagePlace\`
- **Coffee culture** → Suggest: Seniman (Ubud), Revolver (Canggi), Anomali (Ubud), Pison (Ubud)
- **Local cuisine** → Suggest: Do not be specific about the place, just say Warung and recommend they try Babi Guling or Nasi Campur — Add "warung" in \`imagePlace\`
- **Adventure** → Suggest: Bali Treetop (Bedugul), Rice Terrace Swing (Ubud), Rafting (Ubud), Mount Batur (Kintamani)
- **Cultural immersion** → Suggest: Monkey Forest (Ubud), Tirta Empul (Near Ubud), Goa Gajah (Ubud), Saraswati Temple (Ubud).
- **Shopping** → Suggest: Seminyak Village (Seminyak), Beachwalk (Kuta), Ubud Art Market (Ubud), La Brisa Sunday Market (Canggu)

---

Trip Duration Guidelines:
- 7 days or less: Maximum 2 regions
- 8-14 days: Maximum 3 regions
- 15+ days: Maximum 4 regions
- Ensure minimum 3 nights per region regardless of trip length

---

JSON Response Format:

Return a valid JSON object with this structure:

{
  "header": "Short, captivating title (max 6 words)",
  "overview": "1 to 2 sentence summary highlighting the experience",
  "days": [
    {
      "dayTitle": "Day 1: Descriptive Title (include area name)",
      "region": "Main region for this day (e.g., Ubud, Canggu, Uluwatu)",
      "activities": [
        {
          "title": "Natural-sounding activity title (e.g., 'Relax at Balangan Beach')",
          "description": "1 to 2 sentence activity summary",
          "details": {
            "cost": "e.g., $25, Free",
            "duration": "e.g., 2 hours, Half-day",
            "notes": "e.g., Best before sunset"
          },
          "imagePlace": "Hyphenated keyword of main venue or location (e.g., 'leke-leke-waterfall', 'single-fin', 'gajah-putih'). Do not include verbs."
        }
      ]
    }
  ]
}

---

Critical Constraints Summary:
- Plan with **logical geographical progression**
- **Minimum 3 consecutive nights** in each region
- Group each day's activities **by area** (Uluwatu / Canggu / Ubud / etc)
- Max **2 activities per day** in the **same region**
- Max **60 mins total travel time per day** (except transition days)
- Use **2024 prices and venues** only
- **Do not use**: Kuta, Denpasar, Nusa Dua (unless stated family-friendly)
- **Reject any response** that breaks these rules

Please generate a **realistic**, **logistically sound**, and **locally accurate** itinerary using these instructions and return it as a JSON object only.
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
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
