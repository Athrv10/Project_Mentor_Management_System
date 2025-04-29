const express = require("express");
const {db} = require("../config/db");

const router = express.Router();

// Faculty login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  db.query(
    "SELECT * FROM mentor WHERE email = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Database error during login",
          error: err.message
        });
      }
      
      if (results.length === 0) {
        return res.status(401).json({
          message: "Invalid username or password"
        });
      }
      
      // Don't send the password back to client
      const facultyData = { ...results[0] };
      delete facultyData.password;
      
      res.json({
        message: "Login successful",
        faculty_id: facultyData.mentor_id,
        faculty_name: facultyData.name,
        id: facultyData.mentor_id, // Added id for consistency with frontend
        ...facultyData
      });
    }
  );
});

// Get all faculty
router.get("/", (req, res) => {
  db.query("SELECT * FROM mentor", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Get projects for a specific mentor
router.get("/projects/:mentor_id", (req, res) => {
  const { mentor_id } = req.params;
  
  const sql = `
    SELECT p.*, s.name as student_name, s.email as student_email
    FROM projects p
    JOIN student s ON p.student_id = s.student_id
    WHERE p.mentor_id = ?
  `;
  
  db.query(sql, [mentor_id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching mentor's projects",
        error: err.message
      });
    }
    
    // Process the results to include student information in a more accessible format
    const projects = results.map(project => {
      return {
        ...project,
        students: project.student_name,
        updated_at: project.last_updated || new Date().toISOString()
      };
    });
    
    res.json(projects);
  });
});

// Update project status (approve/reject) and provide feedback
router.put("/projects/:project_id/status", (req, res) => {
  const { project_id } = req.params;
  const { mentor_id, status, feedback } = req.body;
  
  // Validate input
  if (!project_id || !mentor_id || !status) {
    return res.status(400).json({ message: "Missing required information" });
  }
  
  // Get current timestamp
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  const sql = `
    UPDATE projects
    SET
      status = ?,
      mentor_feedback = ?,
      last_updated = ?
    WHERE
      id = ? AND mentor_id = ?
  `;
  
  db.query(sql, [status, feedback, now, project_id, mentor_id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error updating project status",
        error: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: "Project not found or you don't have permission to update it" 
      });
    }
    
    // If project is approved, log this in a separate table for tracking
    if (status === 'Approved') {
      const trackingSql = `
        INSERT INTO project_approvals (project_id, mentor_id, approval_date, comments)
        VALUES (?, ?, ?, ?)
      `;
      
      db.query(trackingSql, [project_id, mentor_id, now, feedback], (trackingErr) => {
        if (trackingErr) {
          console.error("Error logging project approval:", trackingErr);
          // Continue with the response even if tracking fails
        }
      });
    }
    
    res.json({ 
      message: `Project ${status.toLowerCase()} successfully`,
      updated_at: now
    });
  });
});

// Add a faculty member
router.post("/", (req, res) => {
  const { mentor_id, name, email, password, department } = req.body;
  db.query(
    "INSERT INTO mentor (mentor_id, name, email, password, department) VALUES (?, ?, ?, ?, ?)", 
    [mentor_id, name, email, password, department], 
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Faculty added successfully" });
    }
  );
});

// Get students assigned to a mentor
router.get("/:mentor_id/students", (req, res) => {
  const { mentor_id } = req.params;
  
  const sql = `
    SELECT s.*, p.title as project_title, p.status as project_status, p.progress_percentage
    FROM student s
    LEFT JOIN projects p ON s.student_id = p.student_id AND p.mentor_id = ?
    WHERE s.mentor_id = ?
  `;
  
  db.query(sql, [mentor_id, mentor_id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching mentor's students",
        error: err.message
      });
    }
    
    res.json(results);
  });
});

// Delete a faculty member
router.delete("/:mentor_id", (req, res) => {
  const { mentor_id } = req.params;
  db.query("DELETE FROM mentor WHERE mentor_id = ?", [mentor_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.json({ message: "Faculty deleted successfully" });
  });
});

// Update a faculty member
router.put("/:mentor_id", (req, res) => {
  const { mentor_id } = req.params;
  const { name, email, password, department } = req.body;
  const sql = `
    UPDATE mentor
    SET
      name = ?,
      email = ?,
      password = ?,
      department = ?
    WHERE
      mentor_id = ?
  `;

  db.query(sql, [name, email, password, department, mentor_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.json({ message: "Faculty updated successfully." });
  });
});

// Get a faculty member by ID
router.get("/:mentor_id", (req, res) => {
  const { mentor_id } = req.params;
  const sql = `
    SELECT * FROM mentor WHERE mentor_id = ?
  `;

  db.query(sql, [mentor_id], (err, results) => {
    if (err) return res.status(500).json(err);
    
    if (results.length === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    
    // Don't send password to client
    const facultyData = { ...results[0] };
    delete facultyData.password;
    
    res.json(facultyData);
  });
});

module.exports = router;
