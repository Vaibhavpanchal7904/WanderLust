const express = require("express");
const router = express.Router();

// Index route for users
router.get("/", (req, res) => {
    res.send("GET all users");
});

// Show route for a single user
router.get("/:id", (req, res) => {
    res.send(`GET user with ID ${req.params.id}`);
});

// Create a new user
router.post("/", (req, res) => {
    res.send("POST new user");
});

// Delete a user by ID
router.delete("/:id", (req, res) => {
    res.send(`DELETE user with ID ${req.params.id}`);
});

module.exports = router;
