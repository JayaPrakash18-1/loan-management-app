const express = require("express");
const pool = require("../db/db.js");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_app_id = $1 ORDER BY created_at DESC LIMIT 50",
      [req.appId]
    );
    res.json(result.rows);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/read", auth, async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_app_id = $2",
      [req.params.id, req.appId]
    );
    res.json({ message: "Marked as read" });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Search API (Optional extension from module 8)
router.get("/users/search", auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const result = await pool.query(
      "SELECT app_id, name, email, phone FROM users WHERE (app_id ILIKE $1 OR name ILIKE $1 OR phone ILIKE $1) AND app_id != $2 LIMIT 10",
      [`%${query}%`, req.appId]
    );
    res.json(result.rows);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
