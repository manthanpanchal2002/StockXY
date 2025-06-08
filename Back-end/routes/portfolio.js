const express = require("express");
const db = require("../db"); 
const { authenticateJWT } = require("../middleware");

const router = express.Router();

router.post("/", authenticateJWT, async (req, res) => {
    const { stock_symbol } = req.body;
    const userId = req.user.id;

    try {
        const result = await db.query(
            "INSERT INTO portfolio (user_id, stock_symbol) VALUES ($1, $2) RETURNING *",
            [userId, stock_symbol]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding stock to portfolio:", error.message);
        res.status(500).json({ error: "Failed to add stock", details: error.message });
    }
});

router.get("/", authenticateJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.query(
            "SELECT stock_symbol FROM portfolio WHERE user_id = $1",
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching portfolio:", error.message);
        res.status(500).json({ error: "Failed to fetch portfolio", details: error.message });
    }
});

router.delete("/", authenticateJWT, async (req, res) => {
    const { stock_symbol } = req.body;
    const userId = req.user.id;

    try {
        const result = await db.query(
            "DELETE FROM portfolio WHERE user_id = $1 AND stock_symbol = $2 RETURNING *",
            [userId, stock_symbol]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Stock not found in portfolio" });
        }
        res.json({ message: "Stock removed from portfolio" });
    } catch (error) {
        console.error("Error removing stock:", error.message);
        res.status(500).json({ error: "Failed to remove stock", details: error.message });
    }
});


router.get("/live", authenticateJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.query(
            "SELECT stock_symbol FROM portfolio WHERE user_id = $1",
            [userId]
        );

        const stocks = result.rows.map(row => row.stock_symbol);

        if (stocks.length === 0) {
            return res.json({ message: "No stocks in portfolio" });
        }

        const stockList = stocks.join(',');
        const response = await fetch(``);
        const data = await response.json();

        res.json(data);

    } catch (error) {
        console.error("Error fetching portfolio with live prices:", error.message);
        res.status(500).json({ error: "Failed to fetch portfolio live prices", details: error.message });
    }
});


module.exports = router;
