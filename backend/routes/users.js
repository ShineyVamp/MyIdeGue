const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const userController = require('../controllers/userController'); // Import Controller

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } 
});

// --- ROUTES ---

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserDetail);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);

// Protected
router.post('/:id/follow', auth, userController.toggleFollow);
router.delete('/:id/remove-follower', auth, userController.removeFollower);
router.put('/profile', auth, userController.updateProfile);
router.post('/upload-avatar', upload.single('avatar'), userController.uploadAvatar);
router.put('/change-email', auth, userController.changeEmail);
router.put('/change-password', auth, userController.changePassword);
router.delete('/delete-account', auth, userController.deleteAccount);

// Admin
router.post('/:id/ban', auth, userController.banUser);
router.post('/:id/unban', auth, userController.unbanUser);

module.exports = router;