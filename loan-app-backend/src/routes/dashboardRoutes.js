const express = require("express");
const pool = require("../db/db.js");
const auth = require("../middleware/authMiddleware");
const { monthsBetween, simpleInterest, compoundInterest } = require("../utils/interestCalc.js");

const router = express.Router();

router.get("/summary", auth, async (req, res) => {
  try {
    const appId = req.appId;

    // 1. Total given / active loans as lender
    const givenRes = await pool.query("SELECT * FROM loans WHERE lender_app_id = $1", [appId]);
    let totalGiven = 0;
    let givenActive = 0;
    let expectedInterestToEarn = 0;

    const today = new Date();

    for (let loan of givenRes.rows) {
      if (loan.status === 'ACTIVE') {
        givenActive++;
        totalGiven += Number(loan.principal);
        
        const months = monthsBetween(loan.start_date, today);
        if (loan.interest_type === 'SI') {
          expectedInterestToEarn += simpleInterest(Number(loan.principal), Number(loan.interest_rate), months);
        } else {
          expectedInterestToEarn += compoundInterest(Number(loan.principal), Number(loan.interest_rate), months);
        }
      }
    }

    // 2. Total taken / active loans as borrower
    const takenRes = await pool.query("SELECT * FROM loans WHERE borrower_app_id = $1", [appId]);
    let totalTaken = 0;
    let takenActive = 0;
    let expectedInterestToPay = 0;

    for (let loan of takenRes.rows) {
      if (loan.status === 'ACTIVE') {
        takenActive++;
        totalTaken += Number(loan.principal);

        const months = monthsBetween(loan.start_date, today);
        if (loan.interest_type === 'SI') {
          expectedInterestToPay += simpleInterest(Number(loan.principal), Number(loan.interest_rate), months);
        } else {
          expectedInterestToPay += compoundInterest(Number(loan.principal), Number(loan.interest_rate), months);
        }
      }
    }

    // Calculate actual interest earned so far (from payments made to this lender)
    const earnedRes = await pool.query(`
      SELECT SUM(p.amount) as earned 
      FROM payments p 
      JOIN loans l ON p.loan_id = l.id 
      WHERE l.lender_app_id = $1 AND p.payment_type = 'INTEREST'
    `, [appId]);
    const actualInterestEarned = Number(earnedRes.rows[0].earned || 0);

    res.json({
      total_given: totalGiven,
      total_taken: totalTaken,
      active_loans_given: givenActive,
      active_loans_taken: takenActive,
      expected_interest_to_earn: Number(expectedInterestToEarn.toFixed(2)),
      expected_interest_to_pay: Number(expectedInterestToPay.toFixed(2)),
      actual_interest_earned: actualInterestEarned
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
