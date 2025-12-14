const db = require('../config/database');

// GET NOTIFICATIONS
exports.getNotifications = (req, res) => {
    // Debug: Cek siapa yang request
    console.log("Fetching notif for user:", req.user.id);

    const query = `
        SELECT 
            n.id,
            n.recipient_id,
            n.sender_id,
            n.type,
            n.post_id,
            n.is_read,
            n.created_at,
            u.username as senderHandle, 
            u.full_name as senderName, 
            u.avatar_url as senderAvatar,
            p.content as postContent,
            -- SUBQUERY: Ambil isi komentar jika tipe notifikasi adalah comment
            (
                SELECT content 
                FROM comments 
                WHERE post_id = n.post_id 
                AND user_id = n.sender_id 
                ORDER BY created_at DESC 
                LIMIT 1
            ) as commentPreview
        FROM notifications n
        LEFT JOIN users u ON n.sender_id = u.id  
        LEFT JOIN posts p ON n.post_id = p.id    
        WHERE n.recipient_id = ?
        ORDER BY n.created_at DESC
    `;
    
    db.query(query, [req.user.id], (err, results) => {
        if (err) {
            console.error("Error DB Notif:", err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
};

// MARK READ
exports.markRead = (req, res) => {
    const query = "UPDATE notifications SET is_read = 1 WHERE recipient_id = ?";
    db.query(query, [req.user.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Marked as read' });
    });
};