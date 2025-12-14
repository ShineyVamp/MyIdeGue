const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const postController = require('../controllers/postController');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } 
});

// --- ROUTES ---

// Upload
router.post('/upload-image', auth, upload.single('image'), postController.uploadImage);

// Trending
router.get('/trending', auth, postController.getTrending); 

// Posts CRUD
router.get('/', auth, postController.getAllPosts);
router.post('/', auth, postController.createPost);
router.delete('/:id', auth, postController.deletePost);

// Comments
router.get('/:id/comments', auth, postController.getComments);
router.post('/:id/comments', auth, postController.createComment);
router.delete('/comments/:commentId', auth, postController.deleteComment);

// Votes
router.post('/:id/vote', auth, postController.votePost);
router.post('/comments/:commentId/vote', auth, postController.voteComment);

module.exports = router;