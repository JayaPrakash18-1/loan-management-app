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
    const resUsers = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'users\';');
    console.log("Users schema:", resUsers.rows);
    const resLoans = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'loans\';');
    console.log("Loans schema:", resLoans.rows);
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}
test();
