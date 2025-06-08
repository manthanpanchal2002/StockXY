const express = require("express");
const { authenticateJWT } = require('../middleware');
const router = express.Router();
const fetch = require("node-fetch");

const STOCK_API_KEY = process.env.STOCK_API_KEY; 

router.get("/",authenticateJWT, async (req, res) => {
    try {
  
        const [gainers, losers, active, largeCap, midCap, smallCap] = await Promise.all([
        ]);

        res.json({
            top_gainers: gainers,
            top_losers: losers,
            most_active: active,
            large_cap: largeCap,
            mid_cap: midCap,
            small_cap: smallCap
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        res.status(500).json({ error: "Failed to fetch dashboard data", details: error.message });
    }
});

module.exports = router;
