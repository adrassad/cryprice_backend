import pkg from 'pg';
import { ENV } from '../config/env.js';

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  //console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}
