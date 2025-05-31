const express = require("express");
const router = express.Router();

// Index route for posts
router.get("/", (req, res) => {
    res.send("GET all posts");
});

// Show route for a single post
router.get("/:id", (req, res) => {
    res.send(`GET post with ID ${req.params.id}`);
});

// Create a new post
router.post("/", (req, res) => {
    res.send("POST new post");
});

// Delete a post by ID
router.delete("/:id", (req, res) => {
    res.send(`DELETE post with ID ${req.params.id}`);
});

module.exports = router;
