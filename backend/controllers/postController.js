const db = require('../config/database');
const supabase = require('../config/supabaseClient');
const BUCKET_NAME = 'images'; 

// --- FUNGSI BANTUAN INTERNAL ---
const getScore = (table, columnId, id, callback) => {
    const query = `
        SELECT COALESCE(SUM(CASE WHEN type = 'up' THEN 1 WHEN type = 'down' THEN -1 ELSE 0 END), 0) as score 
        FROM ${table} WHERE ${columnId} = ?
    `;
    db.query(query, [id], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0].score);
    });
};

// 1. UPLOAD IMAGE
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file' });
        const fileName = `posts/${Date.now()}_${req.file.originalname.replace(/\s/g, '_')}`;
        const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
        if (error) return res.status(500).json({ message: 'Upload failed', error });
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        res.json({ url: data.publicUrl });
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// 2. GET TRENDING
exports.getTrending = (req, res) => {
    const query = `
        SELECT 
            p.category, 
            COUNT(DISTINCT p.id) as postCount, 
            COALESCE(SUM(CASE WHEN pv.type = 'up' THEN 1 WHEN pv.type = 'down' THEN -1 ELSE 0 END), 0) as totalUpvotes
        FROM posts p 
        LEFT JOIN post_votes pv ON p.id = pv.post_id 
        WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        GROUP BY p.category 
        ORDER BY totalUpvotes DESC, postCount DESC LIMIT 5
    `;
    db.query(query, (err, results) => { 
        if (err) return res.status(500).send(err); 
        res.json(results); 
    });
};

// 3. GET ALL POSTS
exports.getAllPosts = (req, res) => {
    const currentUserId = req.user.id; 
    const query = `
        SELECT p.*, u.username as handle, u.full_name as name, u.avatar_url as avatar, u.badge,
        (SELECT COALESCE(SUM(CASE WHEN type = 'up' THEN 1 WHEN type = 'down' THEN -1 ELSE 0 END), 0) FROM post_votes WHERE post_id = p.id) as upvotes,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND parent_id IS NULL) as commentCount,
        (SELECT type FROM post_votes WHERE post_id = p.id AND user_id = ?) as userVote
        FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC
    `;
    db.query(query, [currentUserId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// 4. CREATE POST
exports.createPost = (req, res) => {
    const { content, category, image_url } = req.body;
    const finalImage = Array.isArray(image_url) ? (image_url[0] || '') : (image_url || '');
    db.query("INSERT INTO posts (user_id, content, category, image_url) VALUES (?, ?, ?, ?)", 
        [req.user.id, content, category, finalImage], 
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Post created', id: result.insertId });
        }
    );
};

// 5. DELETE POST
exports.deletePost = (req, res) => {
    db.query("SELECT * FROM posts WHERE id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).json({ message: 'Post not found' });

        const post = results[0];
        if (post.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        db.query("DELETE FROM posts WHERE id = ?", [req.params.id], (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Post deleted' });
        });
    });
};

// 6. GET COMMENTS
exports.getComments = (req, res) => {
    const currentUserId = req.user.id;
    const query = `
        SELECT c.*, u.username as handle, u.full_name as name, u.avatar_url as avatar, u.badge,
        (SELECT COALESCE(SUM(CASE WHEN type = 'up' THEN 1 WHEN type = 'down' THEN -1 ELSE 0 END), 0) FROM comment_votes WHERE comment_id = c.id) as score,
        (SELECT type FROM comment_votes WHERE comment_id = c.id AND user_id = ?) as userVote
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = ? 
        ORDER BY c.created_at ASC
    `;
    
    db.query(query, [currentUserId, req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        
        const commentMap = {};
        const roots = [];
        results.forEach(c => { c.replies = []; commentMap[c.id] = c; });
        results.forEach(c => {
            if (c.parent_id && commentMap[c.parent_id]) {
                commentMap[c.parent_id].replies.push(c);
            } else {
                roots.push(c);
            }
        });
        res.json(roots.reverse());
    });
};

// 7. CREATE COMMENT
exports.createComment = (req, res) => {
    const { content, parent_id } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;
    const finalParentId = parent_id || null;

    db.query("INSERT INTO comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)", [postId, userId, content, finalParentId], (err, result) => {
        if (err) return res.status(500).send(err);
        
        if (finalParentId) {
            db.query("SELECT user_id FROM comments WHERE id = ?", [finalParentId], (err, parents) => {
                if (!err && parents.length > 0 && parents[0].user_id !== userId) {
                    db.query("INSERT INTO notifications (recipient_id, sender_id, type, post_id, created_at) VALUES (?, ?, 'comment', ?, NOW())", [parents[0].user_id, userId, postId]);
                }
            });
        } else {
            db.query("SELECT user_id FROM posts WHERE id = ?", [postId], (err, posts) => {
                if (posts.length > 0 && posts[0].user_id !== userId) {
                    db.query("INSERT INTO notifications (recipient_id, sender_id, type, post_id, created_at) VALUES (?, ?, 'comment', ?, NOW())", [posts[0].user_id, userId, postId]);
                }
            });
        }
        res.json({ message: 'Comment added', id: result.insertId });
    });
};

// 8. DELETE COMMENT
exports.deleteComment = (req, res) => {
    db.query("SELECT * FROM comments WHERE id = ?", [req.params.commentId], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).json({ message: 'Comment not found' });

        const comment = results[0];
        if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        db.query("DELETE FROM comments WHERE id = ?", [req.params.commentId], (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Comment deleted' });
        });
    });
};

// 9. VOTE POST
exports.votePost = (req, res) => {
    const { type } = req.body; 
    const postId = req.params.id;
    const userId = req.user.id;

    db.query("SELECT * FROM post_votes WHERE user_id = ? AND post_id = ?", [userId, postId], (err, results) => {
        if (err) return res.status(500).send(err);
        let previousType = results.length > 0 ? results[0].type : null;

        const finalize = () => {
            getScore('post_votes', 'post_id', postId, (err, score) => {
                db.query("SELECT type FROM post_votes WHERE user_id = ? AND post_id = ?", [userId, postId], (err, statusRes) => {
                    const currentVote = statusRes.length > 0 ? statusRes[0].type : null;
                    res.json({ newUpvotes: score, userVote: currentVote });
                });
            });
        };

        if (previousType) {
            if (previousType === type) {
                db.query("DELETE FROM post_votes WHERE user_id = ? AND post_id = ?", [userId, postId], finalize);
            } else {
                db.query("UPDATE post_votes SET type = ? WHERE user_id = ? AND post_id = ?", [type, userId, postId], finalize);
            }
        } else {
            db.query("INSERT INTO post_votes (user_id, post_id, type) VALUES (?, ?, ?)", [userId, postId, type], finalize);
            if (type === 'up') {
                db.query("SELECT user_id FROM posts WHERE id = ?", [postId], (err, posts) => {
                    if (!err && posts.length > 0 && posts[0].user_id !== userId) {
                        db.query("SELECT * FROM notifications WHERE recipient_id = ? AND sender_id = ? AND type = 'upvote' AND post_id = ?", 
                            [posts[0].user_id, userId, postId], (err, notifs) => {
                                if (!err && notifs.length === 0) {
                                    db.query("INSERT INTO notifications (recipient_id, sender_id, type, post_id, created_at) VALUES (?, ?, 'upvote', ?, NOW())", [posts[0].user_id, userId, postId]);
                                }
                        });
                    }
                });
            }
        }
    });
};

// 10. VOTE COMMENT
exports.voteComment = (req, res) => {
    const { type } = req.body;
    const commentId = req.params.commentId;
    const userId = req.user.id;

    db.query("SELECT * FROM comment_votes WHERE user_id = ? AND comment_id = ?", [userId, commentId], (err, results) => {
        if (err) return res.status(500).send(err);
        let previousType = results.length > 0 ? results[0].type : null;

        const finalize = () => {
            getScore('comment_votes', 'comment_id', commentId, (err, score) => {
                db.query("SELECT type FROM comment_votes WHERE user_id = ? AND comment_id = ?", [userId, commentId], (err, statusRes) => {
                    const currentVote = statusRes.length > 0 ? statusRes[0].type : null;
                    res.json({ newScore: score, userVote: currentVote });
                });
            });
        };

        if (previousType) {
            if (previousType === type) {
                db.query("DELETE FROM comment_votes WHERE user_id = ? AND comment_id = ?", [userId, commentId], finalize);
            } else {
                db.query("UPDATE comment_votes SET type = ? WHERE user_id = ? AND comment_id = ?", [type, userId, commentId], finalize);
            }
        } else {
            db.query("INSERT INTO comment_votes (user_id, comment_id, type) VALUES (?, ?, ?)", [userId, commentId, type], finalize);
        }
    });
};