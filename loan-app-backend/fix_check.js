const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "JPvirat@2005",
  database: "loan_app",
  port: 5432
});

async function fix() {
  const client = await pool.connect();
  try {
    const res = await client.query("ALTER TABLE payments DROP CONSTRAINT payments_payment_type_check;");
    console.log("Constraint dropped!");
  } catch (err) {
    if (err.code === '42704') console.log("Constraint didn't exist");
    else console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

fix();
