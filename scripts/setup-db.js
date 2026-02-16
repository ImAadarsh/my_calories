const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function init() {
  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    console.log('Initializing database...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        image TEXT,
        sex ENUM('male', 'female', 'other'),
        age INT,
        height INT,
        weight FLOAT,
        target_weight FLOAT,
        activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'),
        goal ENUM('lose', 'maintain', 'gain', 'muscle', 'other'),
        daily_calorie_goal INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS meals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255),
        food_name VARCHAR(255) NOT NULL,
        description TEXT,
        calories INT NOT NULL,
        image_url TEXT,
        eaten_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  } finally {
    await pool.end();
  }
}

init();
