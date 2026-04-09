const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "JPvirat@2005",
  database: "loan_app",
  port: 5432
});

async function run() {
  try {
    const loanRes = await pool.query("SELECT * FROM loans WHERE status = 'ACTIVE' LIMIT 1");
    if (loanRes.rows.length === 0) return console.log("No active loans to test.");
    const loan = loanRes.rows[0];
    console.log("Testing loan id: ", loan.id);
    
    // Simulate manual route
    const amount = 50;
    const payment_type = 'FULL';
    
    await pool.query(
      "INSERT INTO payments (loan_id, payer_app_id, amount, payment_type, status) VALUES ($1, $2, $3, $4, 'COMPLETED')",
      [loan.id, loan.borrower_app_id, amount, payment_type]
    );
    
    await pool.query("UPDATE loans SET status = 'CLOSED' WHERE id = $1", [loan.id]);

    console.log("Manual close successful!");
  } catch (err) {
    console.error("Error testing manual payment:", err.message);
  } finally {
    pool.end();
  }
}
run();
