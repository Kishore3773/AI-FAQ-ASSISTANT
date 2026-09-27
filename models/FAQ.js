const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },

    answer: {
        type: String,
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false
    }
});

module.exports = mongoose.model("FAQ", faqSchema);