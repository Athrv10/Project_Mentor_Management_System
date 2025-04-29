const express = require("express");
const { db } = require("../config/db");

const router = express.Router();

// Get all projects
router.get("/", (req, res) => {
  db.query("SELECT * FROM projects", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Get projects by student ID
router.get("/student/:student_id", (req, res) => {
  const { student_id } = req.params;
  
  const sql = `
    SELECT p.*, s.name as student_name, m.name as mentor_name
    FROM projects p
    JOIN student s ON p.student_id = s.student_id
    JOIN mentor m ON p.mentor_id = m.mentor_id
    WHERE p.student_id = ?
  `;
  
  db.query(sql, [student_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Get projects by mentor ID
router.get("/mentor/:mentor_id", (req, res) => {
  const { mentor_id } = req.params;
  
  const sql = `
    SELECT p.*, s.name as student_name, s.github_link
    FROM projects p
    JOIN student s ON p.student_id = s.student_id
    WHERE p.mentor_id = ?
  `;
  
  db.query(sql, [mentor_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Create a new project proposal
router.post("/", (req, res) => {
  const { title, description, student_id, mentor_id } = req.body;
  
  // First, get the highest project_id to create a new one
  db.query("SELECT MAX(CAST(SUBSTRING(project_id, 4) AS UNSIGNED)) as max_id FROM projects", (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error creating project proposal",
        error: err.message
      });
    }
    
    // Calculate new project ID
    const maxId = result[0].max_id || 1000;
    const newProjectId = `PRJ${maxId + 1}`;
    
    const sql = `
      INSERT INTO projects (project_id, title, description, student_id, mentor_id, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `;
    
    db.query(sql, [newProjectId, title, description, student_id, mentor_id], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Error creating project proposal",
          error: err.message
        });
      }
      
      res.status(201).json({
        message: "Project proposal submitted successfully",
        project_id: newProjectId,
        id: result.insertId
      });
    });
  });
});

// Update project status (approve or reject)
router.put("/status/:project_id", (req, res) => {
  const { project_id } = req.params;
  const { status, feedback } = req.body;
  
  if (!['Pending', 'Approved', 'Rejected', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({
      message: "Invalid status value"
    });
  }
  
  const sql = `
    UPDATE projects
    SET status = ?, mentor_feedback = ?
    WHERE id = ? OR project_id = ?
  `;
  
  db.query(sql, [status, feedback, project_id, project_id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error updating project status",
        error: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Project not found"
      });
    }
    
    res.json({
      message: "Project status updated successfully"
    });
  });
});

// Update project progress
router.put("/progress/:project_id", (req, res) => {
  const { project_id } = req.params;
  const { progress_percentage, status } = req.body;
  
  // Validate progress percentage
  if (progress_percentage < 0 || progress_percentage > 100) {
    return res.status(400).json({
      message: "Progress percentage must be between 0 and 100"
    });
  }
  
  let sql = "UPDATE projects SET progress_percentage = ?";
  let params = [progress_percentage];
  
  // If status is provided, update it as well
  if (status) {
    if (!['Pending', 'Approved', 'Rejected', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value"
      });
    }
    sql += ", status = ?";
    params.push(status);
  }
  
  sql += " WHERE id = ? OR project_id = ?";
  params.push(project_id, project_id);
  
  db.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error updating project progress",
        error: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Project not found"
      });
    }
    
    res.json({
      message: "Project progress updated successfully"
    });
  });
});

// Get a single project by ID
router.get("/:project_id", (req, res) => {
  const { project_id } = req.params;
  
  const sql = `
    SELECT p.*, s.name as student_name, m.name as mentor_name, s.github_link
    FROM projects p
    JOIN student s ON p.student_id = s.student_id
    JOIN mentor m ON p.mentor_id = m.mentor_id
    WHERE p.id = ? OR p.project_id = ?
  `;
  
  db.query(sql, [project_id, project_id], (err, results) => {
    if (err) return res.status(500).json(err);
    
    if (results.length === 0) {
      return res.status(404).json({
        message: "Project not found"
      });
    }
    
    res.json(results[0]);
  });
});

// Delete a project
router.delete("/:project_id", (req, res) => {
  const { project_id } = req.params;
  
  db.query("DELETE FROM projects WHERE id = ? OR project_id = ?", [project_id, project_id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error deleting project",
        error: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Project not found"
      });
    }
    
    res.json({
      message: "Project deleted successfully"
    });
  });
});

// MESSAGES ROUTES

// Get all messages for a project
router.get("/:project_id/messages", (req, res) => {
  const { project_id } = req.params;
  
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
      return res.status(500).json({
        message: "Error fetching messages",
        error: err.message
      });
    }
    
    res.json(results);
  });
});

// Add a new message
router.post("/:project_id/messages", (req, res) => {
  const { project_id } = req.params;
  const { sender_type, sender_id, message_text } = req.body;
  
  if (!['student', 'mentor'].includes(sender_type)) {
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
      return res.status(500).json({
        message: "Error sending message",
        error: err.message
      });
    }
    
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
        return res.status(201).json({
          message: "Message sent successfully but couldn't retrieve details",
          message_id: result.insertId
        });
      }
      
      res.status(201).json({
        message: "Message sent successfully",
        data: messageResult[0]
      });
    });
  });
});

// Mark messages as read
router.put("/:project_id/messages/read", (req, res) => {
  const { project_id } = req.params;
  const { reader_type, reader_id } = req.body;
  
  if (!['student', 'mentor'].includes(reader_type)) {
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
      return res.status(500).json({
        message: "Error marking messages as read",
        error: err.message
      });
    }
    
    res.json({
      message: "Messages marked as read",
      count: result.affectedRows
    });
  });
});

module.exports = router; 