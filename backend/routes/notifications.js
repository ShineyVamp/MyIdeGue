const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/', auth, notificationController.getNotifications);
router.put('/mark-read', auth, notificationController.markRead);

module.exports = router;