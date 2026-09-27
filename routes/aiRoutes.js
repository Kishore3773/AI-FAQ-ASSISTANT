const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const FAQ = require("../models/FAQ");
const protect = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleMiddleware");

const router = express.Router();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Generate FAQ using Gemini and save it to MongoDB
router.post("/generate-faq", protect, roleCheck("admin", "creator"), async (req, res) => {
    try {
        const { topic, category } = req.body;

        // Check topic
        if (!topic || topic.trim() === "") {
            return res.status(400).json({
                message: "Topic is required"
            });
        }

        // Generate FAQ using Gemini
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `Create one FAQ about ${topic.trim()}.
Return the result in this format:

Question: ...
Answer: ...`
        });

        const generatedText = response.text;

        // Save generated FAQ to MongoDB
        const newFAQ = new FAQ({
    question: `AI Generated FAQ about ${topic.trim()}`,
    answer: generatedText,
    createdBy: req.user.id,
    category: category || null
});
        const savedFAQ = await newFAQ.save();

        // Send response
        res.status(201).json({
            message: "FAQ generated and saved successfully",
            faq: savedFAQ
        });

    } catch (error) {
        console.error("AI FAQ generation error:", error);

        // Gemini temporarily unavailable
        if (error.status === 503) {
            return res.status(503).json({
                message: "Gemini is temporarily busy. Please try again in a moment."
            });
        }

        // Other errors
        res.status(500).json({
            message: "Failed to generate FAQ",
            error: error.message
        });
    }
});

module.exports = router;