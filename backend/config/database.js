/**
 * Konfigurasi Koneksi Database Terpusat.
 * * File ini menangani koneksi ke MySQL sehingga kita tidak perlu 
 * menulis ulang konfigurasi 'createConnection' di setiap file route.
 * Ini membuat kode lebih bersih dan mudah dikelola.
 */

const mysql = require('mysql2');
require('dotenv').config();

// Membuat koneksi database menggunakan variabel lingkungan (.env)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Menghubungkan ke database saat aplikasi dimulai
db.connect((err) => {
    if (err) {
        console.error('[DATABASE] Gagal terhubung ke MySQL:', err);
        // Opsional: process.exit(1) jika database wajib ada
    } else {
        console.log('[DATABASE] Terhubung ke MySQL Database');
    }
});

// Export object 'db' agar bisa digunakan (require) di file lain
module.exports = db;