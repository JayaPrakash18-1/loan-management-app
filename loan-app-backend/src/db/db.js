const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_92dSUBtADeCP@ep-twilight-bread-amv7c85l.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

module.exports = pool;
