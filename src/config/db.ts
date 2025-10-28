import dotenv from 'dotenv';
import { sql as vercelSql } from '@vercel/postgres';

dotenv.config();

// Re-export the sql tagged template for convenience across the app
export const sql = vercelSql;


