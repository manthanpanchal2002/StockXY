const express = require("express");
const axios = require("axios");
const router = express.Router();
const { authenticateJWT } = require('../middleware');
require("dotenv").config();

const STOCK_API_KEY = process.env.STOCK_API_KEY;

router.get("/:symbol",authenticateJWT, async (req, res) => {
    const { symbol } = req.params;

    if (!symbol) {
        return res.status(400).json({ error: "Stock symbol is required" });
    }

    try {
        const response = await axios.get(
        );

        if (!response.data || response.data.length === 0) {
            return res.status(404).json({ error: "Company details not found" });
        }

        res.json(response.data[0]); 
    } catch (error) {
        console.error("Error fetching company details:", error.message);
        res.status(500).json({ error: "Failed to fetch company details", details: error.message });
    }
});

module.exports = router;
