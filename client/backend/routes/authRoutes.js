const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/db.js");

const router = express.Router();

// Generate unique APP ID
function generateAppId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'APP';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Ensure unique app_id exists
    let appId = generateAppId();
    let unique = false;
    while (!unique) {
      const check = await pool.query("SELECT id FROM users WHERE app_id = $1", [appId]);
      if (check.rows.length === 0) {
        unique = true;
      } else {
        appId = generateAppId();
      }
    }

    const result = await pool.query(
      "INSERT INTO users (app_id, name, email, phone, address, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING app_id",
      [appId, name, email, phone || null, address || null, hashedPassword]
    );

    res.json({ message: "User registered successfully", app_id: result.rows[0].app_id });

  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, appId: user.app_id },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        app_id: user.app_id, 
        name: user.name, 
        email: user.email 
      } 
    });

  } catch (err) {
    console.error("LOGIN ERROR", err);
    res.status(500).json({ error: err.message });
  }
});

const auth = require("../middleware/authMiddleware");

router.post("/qr", auth, async (req, res) => {
  try {
    const { qr_base64 } = req.body;
    if (!qr_base64) {
      return res.status(400).json({ message: "No QR code provided" });
    }

    await pool.query("UPDATE users SET phonepe_qr = $1 WHERE app_id = $2", [qr_base64, req.appId]);
    res.json({ message: "QR updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// fetch my qr
router.get("/qr", auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT phonepe_qr FROM users WHERE app_id = $1", [req.appId]);
    res.json({ qr: result.rows[0]?.phonepe_qr || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
