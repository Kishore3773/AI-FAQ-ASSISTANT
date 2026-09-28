const express = require("express");
const FAQ = require("../models/FAQ");
const protect = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleMiddleware");

const router = express.Router();

// TEST API
router.get("/", (req, res) => {
    res.json({
        message: "FAQ API is working"
    });
});

// ADD FAQ
router.post("/", protect, roleCheck("admin", "creator"), async (req, res) => {
    try {
        const { question, answer, category } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                message: "Question and answer are required"
            });
        }

        const newFAQ = new FAQ({
            question: question.trim(),
            answer: answer.trim(),
            createdBy: req.user.id,
            category: category || null
        });

        const savedFAQ = await newFAQ.save();

        res.status(201).json({
            message: "FAQ added successfully",
            faq: savedFAQ
        });

    } catch (error) {
        console.error("Add FAQ error:", error);

        res.status(500).json({
            message: "Failed to save FAQ",
            error: error.message
        });
    }
});

// GET ALL FAQs
router.get("/all", async (req, res) => {
    try {
        const faqs = await FAQ.find();

        res.json(faqs);

    } catch (error) {
        console.error("Get FAQs error:", error);

        res.status(500).json({
            message: "Failed to fetch FAQs"
        });
    }
});

// SEMANTIC SEARCH FAQs
router.get("/search", async (req, res) => {
    try {
        const q = req.query.q;

        if (!q || q.trim() === "") {
            return res.json([]);
        }

        const results = await FAQ.aggregate([
            {
                $vectorSearch: {
                    index: "autoembed_index",
                    path: "question",
                    query: {
                        text: q.trim()
                    },
                    numCandidates: 100,
                    limit: 10
                }
            },
            {
                $project: {
                    _id: 1,
                    question: 1,
                    answer: 1,
                    category: 1,
                    createdBy: 1,
                    score: {
                        $meta: "vectorSearchScore"
                    }
                }
            }
        ]);

        res.json(results);

    } catch (error) {
        console.error("Semantic search error:", error);

        res.status(500).json({
            message: "Semantic search failed"
        });
    }
});

// DELETE FAQ
router.delete("/:id", protect, roleCheck("admin", "creator"), async (req, res) => {
    try {
        const deletedFAQ = await FAQ.findByIdAndDelete(req.params.id);

        if (!deletedFAQ) {
            return res.status(404).json({
                message: "FAQ not found"
            });
        }

        res.json({
            message: "FAQ deleted successfully",
            deletedFAQ: deletedFAQ
        });

    } catch (error) {
        console.error("Delete FAQ error:", error);

        res.status(500).json({
            message: "Failed to delete FAQ"
        });
    }
});

// EDIT FAQ
router.put("/:id", protect, roleCheck("admin", "creator"), async (req, res) => {
    try {
        const { question, answer } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                message: "Question and answer are required"
            });
        }

        const updatedFAQ = await FAQ.findByIdAndUpdate(
            req.params.id,
            {
                question: question.trim(),
                answer: answer.trim()
            },
            {
                new: true
            }
        );

        if (!updatedFAQ) {
            return res.status(404).json({
                message: "FAQ not found"
            });
        }

        res.json({
            message: "FAQ updated successfully",
            faq: updatedFAQ
        });

    } catch (error) {
        console.error("Update FAQ error:", error);

        res.status(500).json({
            message: "Failed to update FAQ"
        });
    }
});

module.exports = router;