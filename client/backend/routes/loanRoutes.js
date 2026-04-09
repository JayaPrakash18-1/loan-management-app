const express = require("express");
const pool = require("../db/db.js");
const auth = require("../middleware/authMiddleware");
const {
  monthsBetween,
  simpleInterest,
  compoundInterest
} = require("../utils/interestCalc.js");

const router = express.Router();

// 1. ADD LOAN (Lender creating a loan)
router.post("/", auth, async (req, res) => {
  try {
    const {
      borrower_app_id,
      principal,
      interest_rate,
      interest_type,
      start_date
    } = req.body;

    if (!borrower_app_id || !principal || !interest_rate || !interest_type || !start_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if borrower exists
    const borrowerCheck = await pool.query("SELECT * FROM users WHERE app_id = $1", [borrower_app_id]);
    if (borrowerCheck.rows.length === 0) {
      return res.status(404).json({ message: "Borrower not found" });
    }

    // Cannot lend to self
    if (req.appId === borrower_app_id) {
      return res.status(400).json({ message: "Cannot lend to yourself" });
    }

    const newLoan = await pool.query(
      `INSERT INTO loans
       (lender_app_id, borrower_app_id, principal, interest_rate, interest_type, start_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.appId, borrower_app_id, principal, interest_rate, interest_type, start_date]
    );

    // Add notification for the borrower
    await pool.query(
      "INSERT INTO notifications (user_app_id, message) VALUES ($1, $2)",
      [borrower_app_id, `You have received a new loan of $${principal} from ${req.appId}`]
    );

    res.json({ message: "Loan added successfully", loan: newLoan.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Calculate metrics for a single loan
async function enrichLoanWithDetails(loan) {
  const today = new Date();
  const months = monthsBetween(loan.start_date, today);

  const principal = Number(loan.principal);
  let accumulated_interest = 0;

  if (loan.interest_type === "SI") {
    accumulated_interest = simpleInterest(principal, loan.interest_rate, months);
  } else {
    accumulated_interest = compoundInterest(principal, loan.interest_rate, months);
  }

  // Get total interest paid
  const payments = await pool.query(
    "SELECT SUM(amount) as paid FROM payments WHERE loan_id = $1 AND payment_type = 'INTEREST'",
    [loan.id]
  );
  
  const interest_paid = Number(payments.rows[0].paid || 0);
  const outstanding_interest = Math.max(0, accumulated_interest - interest_paid);
  
  const total_amount = principal + outstanding_interest;

  return {
    ...loan,
    months_elapsed: months,
    accumulated_interest: Number(accumulated_interest.toFixed(2)),
    interest_paid: Number(interest_paid.toFixed(2)),
    outstanding_interest: Number(outstanding_interest.toFixed(2)),
    total_payable: Number(total_amount.toFixed(2))
  };
}


// 2. GET LOANS GIVEN (Where curr user is Lender)
router.get("/given", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, u.name as borrower_name, u.email as borrower_email, u.phone as borrower_phone
       FROM loans l 
       JOIN users u ON l.borrower_app_id = u.app_id 
       WHERE l.lender_app_id = $1
       ORDER BY l.created_at DESC`,
      [req.appId]
    );

    const loans = await Promise.all(result.rows.map(enrichLoanWithDetails));
    res.json(loans);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. GET LOANS TAKEN (Where curr user is Borrower)
router.get("/taken", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, u.name as lender_name, u.email as lender_email, u.phone as lender_phone, u.phonepe_qr as lender_phonepe_qr
       FROM loans l 
       JOIN users u ON l.lender_app_id = u.app_id 
       WHERE l.borrower_app_id = $1
       ORDER BY l.created_at DESC`,
      [req.appId]
    );

    const loans = await Promise.all(result.rows.map(enrichLoanWithDetails));
    res.json(loans);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
