const express = require("express");
const axios = require("axios");
const { authenticateJWT } = require('../middleware');
const router = express.Router();
require("dotenv").config();

const STOCK_API_KEY = process.env.STOCK_API_KEY;

router.get("/",authenticateJWT, async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        const response = await axios.get(
            ``
        );

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching search results:", error.message);
        res.status(500).json({ error: "Failed to fetch search results", details: error.message });
    }
});

module.exports = router;
