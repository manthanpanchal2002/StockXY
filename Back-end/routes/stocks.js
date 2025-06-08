const express = require('express');
const axios = require('axios');
const { authenticateJWT } = require('../middleware');
const router = express.Router();


router.get("/top-gainers", authenticateJWT, async (req, res) => {
    try {
        const response = await axios.get(
            ``
        );
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching top gainers:", error.message);
        res.status(500).json({ error: "Failed to fetch top gainers" });
    }
});

router.get("/top-losers", authenticateJWT, async (req, res) => {
    try {
        const response = await axios.get(
            ``
        );
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching top losers:", error.message);
        res.status(500).json({ error: "Failed to fetch top losers" });
    }
});

router.get("/actives", authenticateJWT,async (req, res) => {
    try {
        const response = await axios.get(``);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching most active stocks:", error.message);
        res.status(500).json({ error: "Failed to fetch most active stocks", details: error.message });
    }
});


router.get("/large-cap", authenticateJWT, async (req, res) => {
    try {
        const response = await axios.get(
            ``
        );
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching large cap:", error.message);
        res.status(500).json({ error: "Failed to fetch large cap stocks" });
    }
});

router.get("/mid-cap",authenticateJWT, async (req, res) => {

    try {
        const response = await axios.get(``);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching mid cap stocks:", error.message);
        res.status(500).json({ error: "Failed to fetch mid cap stocks" });
    }
});

router.get("/small-cap",authenticateJWT, async (req, res) => {
    
    try {
        const response = await axios.get(``);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching small cap stocks:", error.message);
        res.status(500).json({ error: "Failed to fetch small cap stocks" });
    }
});



module.exports = router;
