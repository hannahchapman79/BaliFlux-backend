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
   ** Nusa Penida and Nusa Lembongan are considered separate islands and both require at least 2 nights seperately.**
  Nusa Penida includes: Diamond Beach, Crystal Bay, Angels Billabong, Broken Beach and snorkelling at Manta Point to view manta rays. You can also see manta rays from cliffs at Nusa Penida (this can ba a tip)
	•	Nusa Lembongan includes: Devils Tear, Mushroom Bay, Sandy Bay Beach, Snorkel at Mangrove Point.

2. CRITICAL: Plan the itinerary with **logical geographical progression**:
   - Group consecutive days in the **same region** with a **minimum 3-night stay** per location
   - Organize the trip to minimize travel time between regions
   - Example: Days 1-3 in Ubud, then Days 4-6 in Canggu, then Days 7-9 in Uluwatu
   - AVOID illogical patterns like: Day 1 Ubud, Day 2 Uluwatu, Day 3 back to Ubud

3. Respect Bali traffic conditions. Assume:
   - Uluwatu ↔ Canggu = 1.5+ hours
   - Ubud ↔ Seminyak = 1.5 hours
   - Max travel time per day: 30 to 60 mins between activities
   - Plan **one transition day** when moving between major regions

4. Only include **currently operating** and **verifiable** Bali locations (as of 2024).

5. Include **realistic timing** for the day and ensure activities are logistically possible.

6. Max 2 activities per day, ideally **morning and afternoon**. Activities should be different types (e.g., avoid suggesting 2x fitness activities in the same day. Max 1x Cultural Immersion activity per day. Do not combine recommendations into 1 activity).

7. Avoid: Kuta, Denpasar, Nusa Dua (unless family-friendly vibe is stated).

8. When suggesting well-known locations, offer lesser-known alternatives where possible.
Example: Instead of Berawa or Echo Beach, recommend Seseh Beach for a quieter experience.

9. When user interests is "off the beaten path", suggest places that are in the off the beaten path list below

---

Preferred Content (Based on User Answers):

**Interests**
- Relaxed → Jungle Fish (A restaurant and pool club in the jungle, in Ubud), La Brisa (Canggu), Boheme Pool Club (Pererenan), Seseh Beach (Seseh), Keliki Coffee (cafe with jungle viewpoint in Ubud), Bingin Beach (Uluwatu), Mari Beach Club (Canggu), Dreamland Beach (Uluwatu), Sideman (Sidemen), Mushroom Beach (Nusa Lembongan), Crystal Bay (Nusa Penida)
- Cultural Immersion → Tirta Empul (Near Ubud), Goa Gajah (Ubud), Saraswati Temple (Ubud), Taman Dedari (Ubud), Penglipuran Village (North of Ubud), Cooking Class (Ubud or Canggu), Balinese Dance Performance at Ubud Palace (Ubud), Evening Kecak Dance at Uluwatu Temple (Uluwatu), Visit local rice farming communities (Sidemen)
- Social & Nightlife → La Brisa (Canggu), The Lawn (Canggu), Savaya (Uluwatu), Single Fin (Uluwatu), Motel Mexicola (Canggu), Desa Kitsune (Canggu)
- Spiritual / Mindful Retreat → Yoga Barn (Ubud), Chandra Yoga (Pererenan), Udara Bali Yoga Resort (Seseh), Radiantly Alive (Ubud), Bali Meditation Retreats (Ubud), ULU Yoga Bali (Uluwatu), Blue Earth Village (Amed), Yoga Bliss (Nusa Lembongan)
- Off the Beaten Path → Sidemen rice terraces (Sidemen), Gembleng (Sideman), Amed beach (Amed), Seseh Beach (Seseh), Kintamani (Kintamani), Nusa Lembongan, Jatiluwih Rice Terraces (North of Ubud), Sebatu (North of Ubud), Bingin Beach Cliff Walk (Uluwatu)

- Focused & Productive → Mimpi Grocery Cafe (Canggu), Tribal Coworking (Canggu), Sari Kitchen & Community (Canggu), Zest Cafe (Ubud), Keliki Coffee (Ubud), Suka Espresso (Uluwatu), CUPPA Espresso Bar (Uluwatu), Suka Espresso (Ubud)
- Fitness & Gym → Bambu Fitness (Uluwatu), Nirvana (Canggu), Bali Social Club (Padel club with wellness centre and pool in Canggu), Campuhan Ridge Walk (Ubud), Jungle Padel (Ubud), Elite Fit Gym (Canggu), Titi Batu Ubud Club (Sports & Wellness Club in Ubud)
- Adventure & Activities → White water rafting (Ubud), Bali Treetop Adventure (Bedugul), Mount Batur sunrise trek (From Ubud), ATV rides (Ubud), Surfing (Canggu, Uluwatu), Snorkeling (Amed, Nusa Penida), Diving (Amed, Tulamben), Cycling tours (Ubud, Sidemen)

**Food Experiences**
- Authentic Balinese Cuisine → Recommend local warungs (suggest Nasi Campur, Babi Guling; imagePlace = "warung")
- Scenic Spots → Jungle Fish (Ubud), Rock Bar (Uluwatu), La Brisa (Pererenan), Taman Dedari (Ubud), Warung Local (local food with rice paddy views in Seseh), Sideman, Kumulilir (Coffee tasting with views in Ubud), Ankhusa Restaurant (Restaurant with jungle view and pool in Ubud), SKOOL Kitchen (Restaurant with sea view in Canggu)
- Brunch Cafés → Crate Café (Canggu), Shady Shack (Canggu), Copenhagen (Canggu), Nourish (Uluwatu), Milk & Madu (Ubud), Sari Kitchen (Canggu), Suka Espresso (Ubud)
- Coffee Culture → Seniman (Ubud), Anomali (Ubud), Revolver (Canggu), Pison (Canggu)
- Unique Dining → The Cave (Uluwatu), Koral Restaurant (Nusa Dua), Sa Mesa (Canggu), Merlins (Ubud), Gajah Putih (Ubud)
- Any Top Rated → Suggest top-rated venues from Google nearby

**Nature Spots**
- Beaches & Coastlines → Seseh Beach (Seseh), Seminyak Beach (Seminyak), Dreamland Beach (Uluwatu), Bingin Beach (Uluwatu), Diamond Beach (Nusa Penida), Mushroom Beach (Nusa Lembongan), Crystal Bay (Nusa Penida)
- Waterfalls → Leke Leke (Ubud), Tukad Cepung (Ubud), Gembleng (Sideman), Nungnung (Ubud)
- Volcanoes → Mount Batur sunrise trek (Kintamani), Mount Agung (Tirta Gangga), Paperhills Cafe (Kintamani), Amed (beach views of Mount Agung)
- Rice Terraces → Tegalalang (Ubud), Sidemen area, Jatiluwih (Jatiluwih), Sebatu (Ubud)

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
- Group each day's activities **by area**
- Max **2 activities per day** in the **same region**
- Max **60 mins total travel time per day** (except transition days)
- Use **2024 prices and venues** only
- Do not use Kuta, Denpasar, Nusa Dua
- Reject any response that breaks these rules

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
