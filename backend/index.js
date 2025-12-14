const express = require('express');
const cors = require('cors');
// Hapus mysql manual, kita tidak butuh createConnection disini lagi karena sudah di handle di config
require('dotenv').config();

// IMPORT KONEKSI DATABASE (Hanya untuk memastikan koneksi berjalan saat start)
require('./config/database'); 

// IMPORT ROUTES
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 5000;

// --- MIDDLEWARE ---
// Mengizinkan akses dari berbagai origin (CORS)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsing body request menjadi JSON
app.use(express.json());

// Menyajikan folder uploads secara statis (jika ada file lokal)
app.use('/uploads', express.static('uploads'));

// Middleware Logging: Mencatat setiap request yang masuk ke console
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// --- DAFTARKAN ROUTES ---
// Semua route API dikelompokkan berdasarkan fungsinya
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// --- GLOBAL ERROR HANDLER ---
// Menangkap error yang tidak tertangani di route manapun
app.use((err, req, res, next) => {
    console.error(">>> TERJADI ERROR DI SERVER:"); 
    console.error(err.stack);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: err.message });
});

// Route sederhana untuk cek status server
app.get('/', (req, res) => {
    res.send('Backend MyIdeGue is Running!');
});

// Jalankan Server
app.listen(port, () => {
    console.log(`[SERVER] Running on port ${port}`);
});