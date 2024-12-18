const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    prompt: String,
    result: String,
    createdAt: { type: Date, default: Date.now }
  });
  module.exports = mongoose.model('Itinerary', itinerarySchema);