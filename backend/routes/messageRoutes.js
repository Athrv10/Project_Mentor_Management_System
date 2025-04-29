const express = require("express");
const router = express.Router();
const db = require("../config/db").db;

// Test endpoint to check if messaging routes are working
router.get("/test", (req, res) => {
  res.json({
    message: "Message routes are working",
    timestamp: new Date().toISOString()
  });
});

// Get all messages for a user (either student or mentor)
router.get("/user/:user_type/:user_id", (req, res) => {
  const { user_type, user_id } = req.params;
  
  if (!['student', 'mentor'].includes(user_type)) {
    return res.status(400).json({
      message: "Invalid user type"
    });
  }
  
  const sql = `
    SELECT m.*, p.project_id as project_code, p.title as project_title,
      CASE 
        WHEN m.sender_type = 'student' THEN s.name 
        WHEN m.sender_type = 'mentor' THEN mt.name
      END as sender_name
    FROM messages m
    JOIN projects p ON m.project_id = p.id
    LEFT JOIN student s ON m.sender_type = 'student' AND m.sender_id = s.student_id
    LEFT JOIN mentor mt ON m.sender_type = 'mentor' AND m.sender_id = mt.mentor_id
    WHERE (p.student_id = ? AND ? = 'student') OR (p.mentor_id = ? AND ? = 'mentor')
    ORDER BY m.sent_at DESC
  `;
  
  db.query(sql, [user_id, user_type, user_id, user_type], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching messages",
        error: err.message
      });
    }
    
    res.json(results);
  });
});

// Get all messages for a project - add logging
router.get("/project/:project_id", (req, res) => {
  const { project_id } = req.params;
  
  console.log(`Getting messages for project ID: ${project_id}`);
  
  const sql = `
    SELECT m.*, 
      CASE 
        WHEN m.sender_type = 'student' THEN s.name 
        WHEN m.sender_type = 'mentor' THEN mt.name
      END as sender_name
    FROM messages m
    LEFT JOIN student s ON m.sender_type = 'student' AND m.sender_id = s.student_id
    LEFT JOIN mentor mt ON m.sender_type = 'mentor' AND m.sender_id = mt.mentor_id
    WHERE m.project_id = ?
    ORDER BY m.sent_at ASC
  `;
  
  db.query(sql, [project_id], (err, results) => {
    if (err) {
      console.error(`Error fetching messages for project ${project_id}:`, err);
      return res.status(500).json({
        message: "Error fetching messages",
        error: err.message
      });
    }
    
    console.log(`Found ${results.length} messages for project ${project_id}`);
    res.json(results);
  });
});

// Get unread message count for a user
router.get("/unread/:user_type/:user_id", (req, res) => {
  const { user_type, user_id } = req.params;
  
  if (!['student', 'mentor'].includes(user_type)) {
    return res.status(400).json({
      message: "Invalid user type"
    });
  }
  
  const sql = `
    SELECT COUNT(*) as unread_count
    FROM messages m
    JOIN projects p ON m.project_id = p.id
    WHERE ((p.student_id = ? AND ? = 'student') OR (p.mentor_id = ? AND ? = 'mentor'))
    AND m.sender_type != ?
    AND m.is_read = FALSE
  `;
  
  db.query(sql, [user_id, user_type, user_id, user_type, user_type], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching unread count",
        error: err.message
      });
    }
    
    res.json({ unread_count: results[0].unread_count });
  });
});

// Add a new message - add logging
router.post("/", (req, res) => {
  const { project_id, sender_type, sender_id, message_text } = req.body;
  
  console.log('Creating new message with data:', req.body);
  
  if (!project_id || !sender_type || !sender_id || !message_text) {
    console.error('Missing required fields:', { project_id, sender_type, sender_id, message_text });
    return res.status(400).json({
      message: "Missing required fields"
    });
  }
  
  if (!['student', 'mentor'].includes(sender_type)) {
    console.error('Invalid sender type:', sender_type);
    return res.status(400).json({
      message: "Invalid sender type"
    });
  }
  
  const sql = `
    INSERT INTO messages (project_id, sender_type, sender_id, message_text)
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(sql, [project_id, sender_type, sender_id, message_text], (err, result) => {
    if (err) {
      console.error('Error sending message:', err);
      return res.status(500).json({
        message: "Error sending message",
        error: err.message
      });
    }
    
    console.log('Message inserted successfully with ID:', result.insertId);
    
    // Get the newly created message with sender info
    const getMessageSql = `
      SELECT m.*, 
        CASE 
          WHEN m.sender_type = 'student' THEN s.name 
          WHEN m.sender_type = 'mentor' THEN mt.name
        END as sender_name
      FROM messages m
      LEFT JOIN student s ON m.sender_type = 'student' AND m.sender_id = s.student_id
      LEFT JOIN mentor mt ON m.sender_type = 'mentor' AND m.sender_id = mt.mentor_id
      WHERE m.message_id = ?
    `;
    
    db.query(getMessageSql, [result.insertId], (err, messageResult) => {
      if (err) {
        console.error('Error retrieving newly created message details:', err);
        return res.status(201).json({
          message: "Message sent successfully but couldn't retrieve details",
          message_id: result.insertId
        });
      }
      
      console.log('Retrieved message details:', messageResult[0]);
      res.status(201).json({
        message: "Message sent successfully",
        data: messageResult[0]
      });
    });
  });
});

// Mark messages as read for a specific user in a project - add logging
router.put("/read", (req, res) => {
  const { project_id, reader_type, reader_id } = req.body;
  
  console.log('Marking messages as read:', req.body);
  
  if (!project_id || !reader_type || !reader_id) {
    console.error('Missing required fields:', { project_id, reader_type, reader_id });
    return res.status(400).json({
      message: "Missing required fields"
    });
  }
  
  if (!['student', 'mentor'].includes(reader_type)) {
    console.error('Invalid reader type:', reader_type);
    return res.status(400).json({
      message: "Invalid reader type"
    });
  }
  
  // Mark as read all messages that were not sent by the reader
  const sql = `
    UPDATE messages
    SET is_read = TRUE
    WHERE project_id = ? AND sender_type != ? AND is_read = FALSE
  `;
  
  db.query(sql, [project_id, reader_type], (err, result) => {
    if (err) {
      console.error('Error marking messages as read:', err);
      return res.status(500).json({
        message: "Error marking messages as read",
        error: err.message
      });
    }
    
    console.log(`Marked ${result.affectedRows} messages as read for project ${project_id}`);
    
    res.json({
      message: "Messages marked as read",
      count: result.affectedRows
    });
  });
});

module.exports = router; 