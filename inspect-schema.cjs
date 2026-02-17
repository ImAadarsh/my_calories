const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function inspectSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    console.log('--- Meals Table Schema ---');
    const [mealsColumns] = await connection.execute('DESCRIBE meals');
    console.table(mealsColumns);

    console.log('\n--- Daily Reports Table Schema ---');
    const [reportsColumns] = await connection.execute('DESCRIBE daily_reports');
    console.table(reportsColumns);

  } catch (error) {
    console.error('Error inspecting schema:', error);
  } finally {
    await connection.end();
  }
}

inspectSchema();
