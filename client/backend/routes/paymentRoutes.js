const express = require("express");
const pool = require("../db/db.js");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Borrower submits a PENDING payment
router.post("/:loanId", auth, async (req, res) => {
  try {
    const { loanId } = req.params;
    const { amount, message } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const loanCheck = await pool.query("SELECT * FROM loans WHERE id = $1", [loanId]);
    if (loanCheck.rows.length === 0) return res.status(404).json({ message: "Loan not found" });

    const loan = loanCheck.rows[0];
    if (loan.borrower_app_id !== req.appId) return res.status(403).json({ message: "Only the borrower can make payments" });
    if (loan.status === 'CLOSED') return res.status(400).json({ message: "Loan is already closed" });

    // Submit PENDING payment
    const payment = await pool.query(
      "INSERT INTO payments (loan_id, payer_app_id, amount, payment_type, status, message) VALUES ($1, $2, $3, 'UNKNOWN', 'PENDING', $4) RETURNING *",
      [loanId, req.appId, amount, message || '']
    );

    // Notify Lender
    await pool.query(
      "INSERT INTO notifications (user_app_id, message) VALUES ($1, $2)",
      [loan.lender_app_id, `Borrower ${req.appId} claims to have sent ₹${amount} via PhonePe. Please verify and approve it in your dashboard.`]
    );

    res.json({ message: "Payment submitted for verification", payment: payment.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Lender fetches pending payments
router.get("/pending", auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name as borrower_name, u.app_id as borrower_id 
      FROM payments p
      JOIN loans l ON p.loan_id = l.id
      JOIN users u ON p.payer_app_id = u.app_id
      WHERE l.lender_app_id = $1 AND p.status = 'PENDING'
      ORDER BY p.payment_date ASC
    `, [req.appId]);
    res.json(result.rows);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Lender approves a payment
router.post("/:paymentId/approve", auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { payment_type } = req.body; // 'FULL' or 'INTEREST'

    const paymentCheck = await pool.query(`
      SELECT p.*, l.lender_app_id, l.principal 
      FROM payments p 
      JOIN loans l ON p.loan_id = l.id 
      WHERE p.id = $1 AND p.status = 'PENDING'
    `, [paymentId]);

    if (paymentCheck.rows.length === 0) return res.status(404).json({ message: "Pending payment not found" });
    const payment = paymentCheck.rows[0];

    if (payment.lender_app_id !== req.appId) return res.status(403).json({ message: "Only lender can approve" });

    await pool.query(
      "UPDATE payments SET status = 'COMPLETED', payment_type = $1 WHERE id = $2",
      [payment_type, paymentId]
    );

    if (payment_type === 'FULL') {
      await pool.query("UPDATE loans SET status = 'CLOSED' WHERE id = $1", [payment.loan_id]);
      await pool.query("INSERT INTO notifications (user_app_id, message) VALUES ($1, $2)", [payment.payer_app_id, `Your payment of ₹${payment.amount} was APPROVED. Your loan is now CLOSED!`]);
    } else {
      await pool.query("INSERT INTO notifications (user_app_id, message) VALUES ($1, $2)", [payment.payer_app_id, `Your interest payment of ₹${payment.amount} was APPROVED.`]);
    }

    res.json({ message: "Payment approved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lender manually adds a completed payment
router.post("/:loanId/manual", auth, async (req, res) => {
  try {
    const { loanId } = req.params;
    const { amount, payment_type } = req.body; // 'FULL' or 'INTEREST'

    if (!amount || !payment_type) return res.status(400).json({ message: "Invalid payment data" });

    const loanCheck = await pool.query("SELECT * FROM loans WHERE id = $1", [loanId]);
    if (loanCheck.rows.length === 0) return res.status(404).json({ message: "Loan not found" });
    
    const loan = loanCheck.rows[0];
    if (loan.lender_app_id !== req.appId) return res.status(403).json({ message: "Only lender can do this" });
    if (loan.status === 'CLOSED') return res.status(400).json({ message: "Loan is already closed" });

    // Insert DIRECTLY as completed
    await pool.query(
      "INSERT INTO payments (loan_id, payer_app_id, amount, payment_type, status) VALUES ($1, $2, $3, $4, 'COMPLETED')",
      [loanId, loan.borrower_app_id, amount, payment_type]
    );

    if (payment_type === 'FULL') {
      await pool.query("UPDATE loans SET status = 'CLOSED' WHERE id = $1", [loanId]);
      await pool.query("INSERT INTO notifications (user_app_id, message) VALUES ($1, $2)", [loan.borrower_app_id, `Your lender manually closed your loan. (Recorded ₹${amount})`]);
    } else {
      await pool.query("INSERT INTO notifications (user_app_id, message) VALUES ($1, $2)", [loan.borrower_app_id, `Your lender logged a manual interest payment of ₹${amount}.`]);
    }

    res.json({ message: "Manual payment added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lender rejects a payment
router.post("/:paymentId/reject", auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // verify lender logic here...
    const paymentCheck = await pool.query("SELECT p.*, l.lender_app_id FROM payments p JOIN loans l ON p.loan_id = l.id WHERE p.id = $1 AND p.status = 'PENDING'", [paymentId]);
    if (paymentCheck.rows.length === 0) return res.status(404).json({ message: "Not found" });
    if (paymentCheck.rows[0].lender_app_id !== req.appId) return res.status(403).json({ message: "Unauthorized" });

    await pool.query("UPDATE payments SET status = 'REJECTED' WHERE id = $1", [paymentId]);
    await pool.query("INSERT INTO notifications (user_app_id, message) VALUES ($1, $2)", [paymentCheck.rows[0].payer_app_id, `Your payment claim of ₹${paymentCheck.rows[0].amount} was REJECTED by the lender.`]);

    res.json({ message: "Payment rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// transaction history
router.get("/history", auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, l.lender_app_id, l.borrower_app_id, l.principal
      FROM payments p
      JOIN loans l ON p.loan_id = l.id
      WHERE (l.lender_app_id = $1 OR l.borrower_app_id = $1) AND p.status = 'COMPLETED'
      ORDER BY p.payment_date DESC
    `, [req.appId]);

    res.json(result.rows);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
