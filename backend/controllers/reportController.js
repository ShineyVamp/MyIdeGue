const db = require('../config/database');

exports.createReport = (req, res) => {
    const { target_id, target_type, reason } = req.body;
    const reporter_id = req.user.id;

    if (!target_id || !target_type || !reason) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = "INSERT INTO reports (reporter_id, target_id, target_type, reason) VALUES (?, ?, ?, ?)";
    
    db.query(query, [reporter_id, target_id, target_type, reason], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Report submitted successfully' });
    });
};