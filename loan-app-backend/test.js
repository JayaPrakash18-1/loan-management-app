const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "JPvirat@2005",
  database: "loan_app",
  port: 5432
});

async function test() {
  try {
    const res = await pool.query("INSERT INTO payments (loan_id, payer_app_id, amount, payment_type, status) VALUES ($1, $2, $3, $4, 'COMPLETED')", [1, 'APP123', 50, 'FULL']);
    console.log("Insert success!");
  } catch (err) {
    console.error("Insert error:", err);
  } finally {
    pool.end();
  }
}
test();
