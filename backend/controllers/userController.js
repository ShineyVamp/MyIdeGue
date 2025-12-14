const db = require('../config/database');
const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs'); // Penting untuk changePassword
const BUCKET_NAME = 'images'; 

// 1. GET ALL USERS
exports.getAllUsers = (req, res) => {
    db.query("SELECT id, username as handle, full_name as name, avatar_url as avatar, badge, is_banned FROM users", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// 2. GET USER DETAIL
exports.getUserDetail = (req, res) => {
    const userId = req.params.id;
    const query = `
        SELECT id, username as handle, full_name as name, email, avatar_url as avatar, badge, is_banned,
        (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followersCount,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as followingCount
        FROM users WHERE id = ?
    `;
    db.query(query, [userId, userId, userId], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(results[0]);
    });
};

// 3. GET FOLLOWERS
exports.getFollowers = (req, res) => {
    const query = `
        SELECT u.id, u.username as handle, u.full_name as name, u.avatar_url as avatar, u.badge
        FROM follows f
        JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = ?
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// 4. GET FOLLOWING
exports.getFollowing = (req, res) => {
    const query = `
        SELECT u.id, u.username as handle, u.full_name as name, u.avatar_url as avatar, u.badge
        FROM follows f
        JOIN users u ON f.following_id = u.id
        WHERE f.follower_id = ?
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// 5. FOLLOW / UNFOLLOW (Anti-Spam Notif)
exports.toggleFollow = (req, res) => {
    const targetId = req.params.id;
    const userId = req.user.id;
    
    if (targetId == userId) return res.status(400).json({ message: "Cant follow self" });

    db.query("SELECT * FROM follows WHERE follower_id = ? AND following_id = ?", [userId, targetId], (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length > 0) {
            // UNFOLLOW
            db.query("DELETE FROM follows WHERE follower_id = ? AND following_id = ?", [userId, targetId], (err) => {
                if (err) return res.status(500).send(err);
                res.json({ status: 'unfollowed' });
            });
        } else {
            // FOLLOW
            db.query("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", [userId, targetId], (err) => {
                if (err) return res.status(500).send(err);
                
                // CEK NOTIFIKASI LAMA (Recycle Notif)
                db.query("SELECT id FROM notifications WHERE recipient_id = ? AND sender_id = ? AND type = 'follow'", [targetId, userId], (err, notifResults) => {
                    if (!err && notifResults.length > 0) {
                        // UPDATE notifikasi lama jadi 'baru' lagi (naik ke atas)
                        db.query("UPDATE notifications SET is_read = 0, created_at = NOW() WHERE id = ?", [notifResults[0].id]);
                    } else {
                        // INSERT notifikasi baru
                        db.query("INSERT INTO notifications (recipient_id, sender_id, type, created_at) VALUES (?, ?, 'follow', NOW())", [targetId, userId]);
                    }
                });
                
                res.json({ status: 'followed' });
            });
        }
    });
};

// 6. REMOVE FOLLOWER
exports.removeFollower = (req, res) => {
    const followerIdToRemove = req.params.id;
    const myId = req.user.id;

    db.query("DELETE FROM follows WHERE follower_id = ? AND following_id = ?", [followerIdToRemove, myId], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Follower removed' });
    });
};

// 7. UPDATE PROFILE
exports.updateProfile = (req, res) => {
    const { handle, badge, avatar } = req.body;
    const query = "UPDATE users SET username = ?, badge = ?, avatar_url = ? WHERE id = ?";
    db.query(query, [handle, badge, avatar, req.user.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Profile updated' });
    });
};

// 8. UPLOAD AVATAR
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const fileName = `avatars/${Date.now()}_${req.file.originalname.replace(/\s/g, '_')}`;
        const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
        if (error) return res.status(500).json({ message: 'Gagal upload', error });
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        res.json({ url: data.publicUrl });
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// 9. CHANGE EMAIL
exports.changeEmail = (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    db.query("UPDATE users SET email = ? WHERE id = ?", [email, req.user.id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Email updated successfully' });
    });
};

// 10. CHANGE PASSWORD
exports.changePassword = (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    db.query("SELECT password FROM users WHERE id = ?", [userId], async (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).json({ message: "User not found" });
        const user = results[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) { return res.status(400).json({ message: "Password lama salah!" }); }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId], (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Password updated successfully' });
        });
    });
};

// 11. DELETE ACCOUNT
exports.deleteAccount = (req, res) => {
    db.query("DELETE FROM users WHERE id = ?", [req.user.id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Account deleted successfully' });
    });
};

// 12. BAN USER (ADMIN)
exports.banUser = (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
    const targetUserId = req.params.id;
    const panciAvatar = "https://hbbznyruolegfpeyqiru.supabase.co/storage/v1/object/public/images/avatars/banned.png"; 
    db.query("UPDATE users SET is_banned = 1, avatar_url = ? WHERE id = ?", [panciAvatar, targetUserId], (err) => {
        if (err) return res.status(500).send(err);
        db.query("DELETE FROM posts WHERE user_id = ?", [targetUserId], (err) => {
            if (err) return res.status(500).send(err);
            db.query("DELETE FROM comments WHERE user_id = ?", [targetUserId], (err) => {
                if (err) return res.status(500).send(err);
                res.json({ message: 'User banned' });
            });
        });
    });
};

// 13. UNBAN USER (ADMIN)
exports.unbanUser = (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
    const targetUserId = req.params.id;
    db.query("SELECT username FROM users WHERE id = ?", [targetUserId], (err, results) => {
        if (err || results.length === 0) return res.status(500).send(err);
        const username = results[0].username;
        const newDefaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        db.query("UPDATE users SET is_banned = 0, avatar_url = ? WHERE id = ?", [newDefaultAvatar, targetUserId], (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'User unbanned' });
        });
    });
};