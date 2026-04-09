const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_92dSUBtADeCP@ep-twilight-bread-amv7c85l.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function resetDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log("Dropping existing tables...");
    await client.query(`DROP TABLE IF EXISTS notifications CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS payments CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS loans CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS users CASCADE;`);

    console.log("Creating users table...");
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        app_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        password_hash TEXT NOT NULL,
        phonepe_qr TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating loans table...");
    await client.query(`
      CREATE TABLE loans (
        id SERIAL PRIMARY KEY,
        lender_app_id VARCHAR(50) REFERENCES users(app_id),
        borrower_app_id VARCHAR(50) REFERENCES users(app_id),
        principal NUMERIC(12, 2) NOT NULL,
        interest_rate NUMERIC(5, 2) NOT NULL,
        interest_type VARCHAR(10) NOT NULL CHECK (interest_type IN ('SI', 'CI')),
        start_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating payments table...");
    await client.query(`
      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
        payer_app_id VARCHAR(50) REFERENCES users(app_id),
        amount NUMERIC(12, 2) NOT NULL,
        payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('FULL', 'INTEREST')),
        status VARCHAR(20) DEFAULT 'COMPLETED',
        message TEXT,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating notifications table...");
    await client.query(`
      CREATE TABLE notifications (
        id SERIAL PRIMARY KEY,
        user_app_id VARCHAR(50) REFERENCES users(app_id),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log("Database reset successfully!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error resetting database:", err);
  } finally {
    client.release();
    pool.end();
  }
}

resetDb();
