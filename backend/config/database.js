const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000, // TiDB biasanya port 4000
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
    }
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Gagal Konek ke TiDB:', err);
    } else {
        console.log('Berhasil Konek ke TiDB Cloud!');
        connection.release();
    }
});

module.exports = db;

