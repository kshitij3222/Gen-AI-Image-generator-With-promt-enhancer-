const mongoose = require("mongoose");

const generationSchema = new mongoose.Schema(
  {

    userId: {
      type: String,
      required: true,
      index: true
    },
    // Original user prompt
    prompt: {
      type: String,
      required: true,
      trim: true
    },

    // AI-enhanced prompt
    enhancedPrompt: {
      type: String,
      required: true
    },

    // Selected visual style
    style: {
      type: String,
      default: "Cinematic"
    },

    // Selected aspect ratio
    aspectRatio: {
      type: String,
      default: "Square"
    },
    favorite: {
      type: Boolean,
      default: false
    },

    // Generated image stored as Base64
    imageData: {
      type: String,
      required: true
    },

    // AI model used
    model: {
      type: String,
      default: "FLUX.1-schnell"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Generation",
  generationSchema
);