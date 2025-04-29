const express = require("express");
const router = express.Router();
const { db } = require('../config/db'); // Import the db connection

// Student login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  db.query(
    "SELECT * FROM student WHERE email = ? AND password = ?",
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
      const studentData = { ...results[0] };
      delete studentData.password;
      
      res.json({
        message: "Login successful",
        student_id: studentData.student_id,
        student_name: studentData.name,
        ...studentData
      });
    }
  );
});

// Get all students
router.get("/student", (req, res) => {
  const sql = `
    SELECT s.*, m.name as mentor_name 
    FROM student s
    LEFT JOIN mentor m ON s.mentor_id = m.mentor_id
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Add a student
router.post("/add", (req, res) => {
  const { name, email, password, mentor_id, prn, github_link } = req.body;
  db.query(
    "INSERT INTO student (name, prn, email, password, mentor_id, github_link) VALUES (?, ?, ?, ?, ?, ?)",
    [name, prn, email, password, mentor_id, github_link || null],
    (err) => {
      if (err) {
        console.error("Error adding student:", err);
        return res.status(500).json({
          message: "Unable to add student.",
          error: err.message,
        });
      }
      res.status(201).json({ message: "Student added successfully" });
    }
  );
});

// Update a student
router.put("/:student_id", (req, res) => {
  const { student_id } = req.params;
  const { name, prn, email, password, mentor_id, github_link } = req.body;

  const sql = `
    UPDATE student
    SET
      name = ?,
      prn = ?,
      email = ?,
      password = ?,
      mentor_id = ?,
      github_link = ?
    WHERE
      student_id = ?
  `;

  db.query(
    sql,
    [name, prn, email, password, mentor_id, github_link || null, student_id],
    (err, result) => {
      if (err) {
        console.error("Error updating student:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json({ message: "Student updated successfully" });
    }
  );
});

// Update student GitHub link only
router.put("/:student_id/github", (req, res) => {
  const { student_id } = req.params;
  const { github_link } = req.body;

  if (!github_link) {
    return res.status(400).json({
      message: "GitHub link is required"
    });
  }

  db.query(
    "UPDATE student SET github_link = ? WHERE student_id = ?",
    [github_link, student_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Error updating GitHub link",
          error: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Student not found"
        });
      }
      
      res.json({
        message: "GitHub link updated successfully"
      });
    }
  );
});

// Get students by mentor ID
router.get("/mentor/:mentor_id", (req, res) => {
  const { mentor_id } = req.params;
  
  db.query(
    "SELECT * FROM student WHERE mentor_id = ?",
    [mentor_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Delete a student
router.delete("/:student_id", (req, res) => {
  const { student_id } = req.params;
  db.query("DELETE FROM student WHERE student_id = ?", [student_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  });
});

// Get a student by ID
router.get("/:student_id", (req, res) => {
  const { student_id } = req.params;
  
  const sql = `
    SELECT s.*, m.name as mentor_name 
    FROM student s
    LEFT JOIN mentor m ON s.mentor_id = m.mentor_id
    WHERE s.student_id = ?
  `;
  
  db.query(sql, [student_id], (err, results) => {
    if (err) return res.status(500).json(err);
    
    if (results.length === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }
    
    const studentData = results[0];
    res.json(studentData);
  });
});

// Submit new project with GitHub link
router.post("/projects", (req, res) => {
  const { title, description, student_id, mentor_id, github_link } = req.body;
  
  if (!title || !student_id || !mentor_id) {
    return res.status(400).json({
      message: "Missing required project information"
    });
  }
  
  // Get the highest project_id currently in the database
  db.query("SELECT MAX(project_id) AS max_id FROM projects", (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error determining next project ID",
        error: err.message
      });
    }
    
    // Start at 1001 or increment the highest ID by 1
    const nextProjectId = result[0].max_id ? result[0].max_id + 1 : 1001;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const sql = `
      INSERT INTO projects (
        project_id, 
        title, 
        description, 
        student_id, 
        mentor_id, 
        status, 
        github_link, 
        submission_date,
        last_updated
      )
      VALUES (?, ?, ?, ?, ?, 'Submitted', ?, ?, ?)
    `;
    
    db.query(
      sql,
      [nextProjectId, title, description, student_id, mentor_id, github_link, now, now],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Error submitting project",
            error: err.message
          });
        }
        
        res.status(201).json({
          message: "Project submitted successfully",
          project_id: nextProjectId,
          id: result.insertId
        });
      }
    );
  });
});

// Update project GitHub link
router.put("/projects/:project_id/github", (req, res) => {
  const { project_id } = req.params;
  const { github_link, student_id } = req.body;
  
  if (!github_link) {
    return res.status(400).json({
      message: "GitHub link is required"
    });
  }
  
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // First verify the student owns this project
  const checkSql = "SELECT * FROM projects WHERE id = ? AND student_id = ?";
  
  db.query(checkSql, [project_id, student_id], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({
        message: "Error verifying project ownership",
        error: checkErr.message
      });
    }
    
    if (checkResults.length === 0) {
      return res.status(403).json({
        message: "You do not have permission to update this project"
      });
    }
    
    // Update the GitHub link
    const updateSql = `
      UPDATE projects 
      SET github_link = ?, last_updated = ?
      WHERE id = ?
    `;
    
    db.query(updateSql, [github_link, now, project_id], (updateErr, updateResult) => {
      if (updateErr) {
        return res.status(500).json({
          message: "Error updating GitHub link",
          error: updateErr.message
        });
      }
      
      res.json({
        message: "GitHub link updated successfully",
        updated_at: now
      });
    });
  });
});

// Get projects for a student
router.get("/:student_id/projects", (req, res) => {
  const { student_id } = req.params;
  
  const sql = `
    SELECT p.*, m.name as mentor_name 
    FROM projects p
    JOIN mentor m ON p.mentor_id = m.mentor_id
    WHERE p.student_id = ?
    ORDER BY p.last_updated DESC
  `;
  
  db.query(sql, [student_id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching student projects",
        error: err.message
      });
    }
    
    res.json(results);
  });
});

module.exports = router;