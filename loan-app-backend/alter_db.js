const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "JPvirat@2005",
  database: "loan_app",
  port: 5432
});

async function alterDb() {
  const client = await pool.connect();
  try {
    console.log("Altering users table...");
    await client.query(`ALTER TABLE users ADD COLUMN phonepe_qr TEXT;`);
    console.log("Added phonepe_qr successfully.");
  } catch (err) {
    if (err.code === '42701') {
      console.log("Column phonepe_qr already exists.");
    } else {
      console.error("Error altering database:", err);
    }
  } finally {
    client.release();
    pool.end();
  }
}

alterDb();
