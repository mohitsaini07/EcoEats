import 'dotenv/config'
import { sql } from './lib/db/client';

async function test() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Connected successfully:', result);
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

test();
