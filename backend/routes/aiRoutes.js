const express = require("express");

const { enhancePrompt } = require("../services/aiService");
const { generateImage } = require("../services/imageService");
const Generation = require("../models/Generation");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// FIREBASE AUTHENTICATION
// ==========================================

// Every AI route requires a valid Firebase ID token
router.use(authMiddleware);


// ==========================================
// ENHANCE PROMPT
// ==========================================

router.post("/enhance-prompt", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    const enhancedPrompt = await enhancePrompt(prompt);

    res.json({
      success: true,
      originalPrompt: prompt,
      enhancedPrompt
    });

  } catch (error) {
    console.error(
      "Prompt enhancement error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to enhance prompt",
      error: error.message
    });
  }
});


// ==========================================
// GENERATE IMAGE
// ==========================================

router.post("/generate-image", async (req, res) => {
  try {
    const {
      prompt,
      enhancedPrompt,
      style,
      aspectRatio
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    console.log(
      "Starting image generation for user:",
      req.userId
    );

    const finalPrompt = `
${enhancedPrompt || prompt}

Visual Style: ${style || "Cinematic"}

Composition: ${aspectRatio || "Square"}

Create a highly detailed, visually appealing image
with professional lighting, strong composition,
and high visual quality.
`;

    const imageBuffer =
      await generateImage(finalPrompt);

    console.log(
      "Image generated successfully."
    );


    // ==========================================
    // CONVERT IMAGE TO BASE64
    // ==========================================

    const imageBase64 =
      imageBuffer.toString("base64");

    const imageData =
      `data:image/png;base64,${imageBase64}`;


    // ==========================================
    // SAVE GENERATION
    // ==========================================

    const generation =
      await Generation.create({

        // Firebase UID
        userId: req.userId,

        prompt,

        enhancedPrompt: finalPrompt,

        imageData,

        style: style || "Cinematic",

        aspectRatio:
          aspectRatio || "Square",

        model: "FLUX.1-schnell"
      });


    console.log(
      "Generation saved:",
      generation._id
    );


    // ==========================================
    // SEND IMAGE
    // ==========================================

    res.set(
      "Content-Type",
      "image/png"
    );

    res.send(imageBuffer);

  } catch (error) {

    console.error(
      "Image generation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to generate image",
      error: error.message
    });
  }
});


// ==========================================
// GET USER GENERATION HISTORY
// ==========================================

router.get("/history", async (req, res) => {
  try {

    const generations =
      await Generation.find({
        userId: req.userId
      })
      .sort({
        createdAt: -1
      })
      .limit(20);


    res.json({
      success: true,
      generations
    });

  } catch (error) {

    console.error(
      "History error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch history",
      error: error.message
    });
  }
});


// ==========================================
// DELETE USER GENERATION
// ==========================================

router.delete(
  "/history/:id",
  async (req, res) => {

    try {

      const generation =
        await Generation.findOne({
          _id: req.params.id,
          userId: req.userId
        });


      if (!generation) {
        return res.status(404).json({
          success: false,
          message: "Generation not found"
        });
      }


      await Generation.findByIdAndDelete(
        req.params.id
      );


      res.json({
        success: true,
        message:
          "Generation deleted successfully"
      });

    } catch (error) {

      console.error(
        "Delete history error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete generation"
      });
    }
  }
);


// ==========================================
// TOGGLE FAVORITE
// ==========================================

router.patch(
  "/history/:id/favorite",
  async (req, res) => {

    try {

      const generation =
        await Generation.findOne({
          _id: req.params.id,
          userId: req.userId
        });


      if (!generation) {
        return res.status(404).json({
          success: false,
          message: "Generation not found"
        });
      }


      generation.favorite =
        !generation.favorite;


      await generation.save();


      res.json({
        success: true,

        favorite:
          generation.favorite,

        message:
          generation.favorite
            ? "Added to favorites"
            : "Removed from favorites"
      });

    } catch (error) {

      console.error(
        "Favorite error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update favorite",

        error: error.message
      });
    }
  }
);


module.exports = router;