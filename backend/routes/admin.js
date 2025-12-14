const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); 
const adminController = require('../controllers/adminController');

// MIDDLEWARE KHUSUS: Cek apakah user adalah Admin
const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Access Denied. Admins only." });
    }
};

// --- ROUTES ---
router.get('/reports', auth, verifyAdmin, adminController.getReports);
router.post('/ban-user/:id', auth, verifyAdmin, adminController.banUser);
router.delete('/delete-content/:type/:id', auth, verifyAdmin, adminController.deleteContent);
router.post('/dismiss-report/:id', auth, verifyAdmin, adminController.dismissReport);

module.exports = router;