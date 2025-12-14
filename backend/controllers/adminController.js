const db = require('../config/database');

// 1. GET ALL REPORTS
exports.getReports = (req, res) => {
    const query = `
        SELECT 
            r.id, 
            r.reporter_id, 
            r.target_id, 
            r.target_type, 
            r.reason, 
            r.status, 
            r.created_at,
            u.username as reporter_name,
            u.avatar_url as reporter_avatar
        FROM reports r
        JOIN users u ON r.reporter_id = u.id
        WHERE r.status = 'pending'
        ORDER BY r.created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
};

// 2. BAN USER
exports.banUser = (req, res) => {
    const targetUserId = req.params.id;
    // URL Avatar Banned sesuai file original Anda
    const panciAvatar = "https://cdn-icons-png.flaticon.com/512/1541/1541466.png";

    // 1. Ban User
    db.query("UPDATE users SET is_banned = 1, avatar_url = ? WHERE id = ?", [panciAvatar, targetUserId], (err) => {
        if (err) return res.status(500).send(err);

        // 2. Tandai report terkait user ini sebagai 'resolved'
        db.query("UPDATE reports SET status = 'resolved' WHERE target_id = ? AND target_type = 'user'", [targetUserId]);

        // 3. Hapus Postingan & Komentar User
        db.query("DELETE FROM posts WHERE user_id = ?", [targetUserId], (err) => {
            if (err) console.error("Error deleting posts:", err); 
            db.query("DELETE FROM comments WHERE user_id = ?", [targetUserId]);
        });

        res.json({ message: 'User banned successfully' });
    });
};

// 3. DELETE CONTENT (Post/Comment)
exports.deleteContent = (req, res) => {
    const { type, id } = req.params;
    let table = type === 'post' ? 'posts' : 'comments';
    
    // Hapus konten
    db.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).send(err);
        
        // Tandai report sebagai selesai (resolved)
        db.query("UPDATE reports SET status = 'resolved' WHERE target_id = ? AND target_type = ?", [id, type]);
        
        res.json({ message: 'Content deleted successfully' });
    });
};

// 4. DISMISS REPORT
exports.dismissReport = (req, res) => {
    db.query("UPDATE reports SET status = 'resolved' WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Report dismissed' });
    });
};