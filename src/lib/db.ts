import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000,
    dateStrings: true,
    timezone: 'Z',
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    maxIdle: 10, // Max idle connections, the pool will close excess connections
    idleTimeout: 60000, // Idle connections timeout, in milliseconds
});

export default pool;

export async function query(sql: string, params?: any[]) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database Query Error:', error);
        throw error;
    }
}
