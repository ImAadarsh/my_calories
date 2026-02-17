const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    console.log('--- Migrating Meals Table ---');
    await connection.execute(`
      ALTER TABLE meals 
      ADD COLUMN IF NOT EXISTS protein INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS carbs INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS fats INT DEFAULT 0
    `);
    console.log('Meals table updated.');

    console.log('\n--- Migrating Daily Reports Table ---');
    await connection.execute(`
      ALTER TABLE daily_reports 
      ADD COLUMN IF NOT EXISTS is_ai_report TINYINT(1) DEFAULT 0
    `);
    console.log('Daily reports table updated.');

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await connection.end();
  }
}

migrate();
