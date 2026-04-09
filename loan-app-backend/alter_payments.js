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
    console.log("Altering payments table...");
    await client.query(`ALTER TABLE payments ADD COLUMN status VARCHAR(20) DEFAULT 'COMPLETED';`);
    console.log("Added status successfully.");
  } catch (err) {
    if (err.code === '42701') {
      console.log("Column status already exists.");
    } else {
      console.error("Error altering database:", err);
    }
  } finally {
    client.release();
    pool.end();
  }
}

alterDb();
