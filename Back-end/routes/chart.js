const express = require("express");
const axios = require("axios");
const { authenticateJWT } = require('../middleware');
const router = express.Router();
require("dotenv").config();

const STOCK_API_KEY = process.env.STOCK_API_KEY; 

router.get("/:symbol",authenticateJWT, async (req, res) => {
    const { symbol } = req.params;
    const { from, to } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: "Stock symbol is required" });
    }

    try {
        const response = await axios.get(
        );

        if (!response.data.historical || response.data.historical.length === 0) {
            return res.status(404).json({ error: "No historical data found" });
        }

        res.json(response.data.historical);
    } catch (error) {
        console.error("Error fetching chart data:", error.message);
        res.status(500).json({ error: "Failed to fetch chart data", details: error.message });
    }
});

module.exports = router;
