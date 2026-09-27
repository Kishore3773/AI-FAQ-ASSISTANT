const express = require("express");
const Category = require("../models/Category");
const protect = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleMiddleware");

const router = express.Router();

// ADD CATEGORY
router.post("/", protect, roleCheck("admin", "creator"), async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({
            name: name.trim()
        });

        if (existingCategory) {
            return res.status(409).json({
                message: "Category already exists"
            });
        }

        const newCategory = new Category({
            name: name.trim(),
            description: description ? description.trim() : ""
        });

        const savedCategory = await newCategory.save();

        res.status(201).json({
            message: "Category added successfully",
            category: savedCategory
        });

    } catch (error) {
        console.error("Add category error:", error);

        res.status(500).json({
            message: "Failed to add category",
            error: error.message
        });
    }
});

// GET ALL CATEGORIES
router.get("/all", async (req, res) => {
    try {
        const categories = await Category.find();

        res.json(categories);

    } catch (error) {
        console.error("Get categories error:", error);

        res.status(500).json({
            message: "Failed to fetch categories",
            error: error.message
        });
    }
});
// EDIT CATEGORY
router.put("/:id", protect, roleCheck("admin", "creator"), async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                description: description ? description.trim() : ""
            },
            {
                new: true
            }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json({
            message: "Category updated successfully",
            category: updatedCategory
        });

    } catch (error) {
        console.error("Update category error:", error);

        res.status(500).json({
            message: "Failed to update category",
            error: error.message
        });
    }
});
// DELETE CATEGORY
router.delete("/:id", protect, roleCheck("admin", "creator"), async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json({
            message: "Category deleted successfully",
            category: deletedCategory
        });

    } catch (error) {
        console.error("Delete category error:", error);

        res.status(500).json({
            message: "Failed to delete category",
            error: error.message
        });
    }
});
module.exports = router;