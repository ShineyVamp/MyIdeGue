const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

// REGISTER
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Semua kolom wajib diisi!' });
    }

    const checkQuery = "SELECT * FROM users WHERE email = ? OR username = ?";
    db.query(checkQuery, [email, username], async (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email atau Username sudah terdaftar!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        const insertQuery = "INSERT INTO users (username, email, password, avatar_url, badge) VALUES (?, ?, ?, ?, ?)";
        db.query(insertQuery, [username, email, hashedPassword, defaultAvatar, 'Warga Sipil'], (err, result) => {
            if (err) return res.status(500).json(err);
            res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });
        });
    });
};

// LOGIN
exports.login = (req, res) => {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) return res.status(400).json({ message: 'Input required!' });

    const query = "SELECT * FROM users WHERE email = ? OR username = ?";
    db.query(query, [identifier, identifier], async (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'User not found!' });

        const user = results[0];

        if (user.is_banned === 1) {
            return res.status(403).json({ message: 'This account has been banned due to violations.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Wrong password!' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user.id,
                handle: user.username,
                name: user.full_name || user.username,
                email: user.email,
                avatar: user.avatar_url,
                badge: user.badge,
                role: user.role 
            }
        });
    });
};