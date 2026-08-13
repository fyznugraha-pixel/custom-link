import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const res = await pool.query('SELECT * FROM "CustomDomain" LIMIT 1');
  console.log(Object.keys(res.rows[0] || {}));
}

check().then(() => process.exit(0)).catch(console.error);
