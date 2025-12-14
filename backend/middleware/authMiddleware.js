/**
 * Middleware: Autentikasi JWT
 * Memastikan hanya user yang memiliki token valid yang bisa mengakses route.
 */
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // 1. Ambil token dari header
    const token = req.header('Authorization');
    
    // 2. Jika token tidak ada, tolak akses
    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak: Token tidak ditemukan' });
    }

    try {
        // 3. Verifikasi token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Simpan data user ke request
        next(); // Lanjut ke controller
    } catch (err) {
        res.status(400).json({ message: 'Token tidak valid' });
    }
};