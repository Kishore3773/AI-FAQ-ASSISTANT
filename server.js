const express = require("express");
const connectDB = require("./db");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const faqRoutes = require("./routes/faqRoutes");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const app = express();


connectDB();

app.use(express.json());
app.use(express.static("public"));

app.use("/api/faqs", faqRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);

app.put("/test-server", (req, res) => {
    res.json({
        message: "Server PUT is working"
    });
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

const PORT = 5001;
app.get("/api/ai/test", async (req, res) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: "Say hello in one short sentence."
        });

        res.json({
            message: response.text
        });

    } catch (error) {
        console.error("Gemini error:", error);

        res.status(500).json({
            message: "Gemini test failed",
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});