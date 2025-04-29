const express = require("express");
const { db } = require("../config/db");

const router = express.Router();

// Admin login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  db.query(
    "SELECT * FROM admin WHERE username = ? AND password = ?",
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
      const adminData = { ...results[0] };
      delete adminData.password;
      
      res.json({
        message: "Login successful",
        admin_id: adminData.admin_id,
        admin_name: adminData.name,
        ...adminData
      });
    }
  );
});

// Get all admins
router.get("/", (req, res) => {
  db.query("SELECT admin_id, name, username FROM admin", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Add a new admin
router.post("/", (req, res) => {
  const { name, username, password } = req.body;
  
  db.query(
    "INSERT INTO admin (name, username, password) VALUES (?, ?, ?)",
    [name, username, password],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Unable to add admin",
          error: err.message
        });
      }
      res.status(201).json({ message: "Admin added successfully" });
    }
  );
});

// Get all students with their mentors
router.get("/students", (req, res) => {
  const sql = `
    SELECT s.*, m.name as mentor_name, m.email as mentor_email 
    FROM student s
    LEFT JOIN mentor m ON s.mentor_id = m.mentor_id
    ORDER BY s.name
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching students data",
        error: err.message
      });
    }
    
    res.json(results);
  });
});

// Get all mentors
router.get("/mentors", (req, res) => {
  db.query("SELECT * FROM mentor ORDER BY name", (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching mentors data",
        error: err.message
      });
    }
    
    // Remove passwords from response
    const mentors = results.map(mentor => {
      const { password, ...mentorWithoutPassword } = mentor;
      return mentorWithoutPassword;
    });
    
    res.json(mentors);
  });
});

// Get all projects with student and mentor details
router.get("/projects", (req, res) => {
  const sql = `
    SELECT p.id, p.project_id, p.title, p.description, p.status, 
           p.progress_percentage, p.mentor_feedback, p.github_link, 
           p.submission_date, p.last_updated,
           s.name as student_name, s.email as student_email, 
           m.name as mentor_name, m.email as mentor_email
    FROM projects p
    JOIN student s ON p.student_id = s.student_id
    JOIN mentor m ON p.mentor_id = m.mentor_id
    ORDER BY p.project_id ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching projects data",
        error: err.message
      });
    }
    
    res.json(results);
  });
});

// Add a new student
router.post("/students", (req, res) => {
  const { name, prn, email, password, mentor_id, github_link } = req.body;
  
  if (!name || !prn || !email || !password) {
    return res.status(400).json({
      message: "Missing required fields"
    });
  }
  
  const sql = `
    INSERT INTO student (name, prn, email, password, mentor_id, github_link)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [name, prn, email, password, mentor_id, github_link], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Error adding student",
        error: err.message
      });
    }
    
    res.status(201).json({
      message: "Student added successfully"
    });
  });
});

// Add a new mentor
router.post("/mentors", (req, res) => {
  const { name, email, password, department } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Missing required fields"
    });
  }
  
  const sql = `
    INSERT INTO mentor (name, email, password, department)
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(sql, [name, email, password, department], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Error adding mentor",
        error: err.message
      });
    }
    
    res.status(201).json({
      message: "Mentor added successfully"
    });
  });
});

// Delete a student
router.delete("/students/:student_id", (req, res) => {
  const { student_id } = req.params;
  
  db.query("DELETE FROM student WHERE student_id = ?", [student_id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error deleting student",
        error: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }
    
    res.json({
      message: "Student deleted successfully"
    });
  });
});

// Delete a mentor
router.delete("/mentors/:mentor_id", (req, res) => {
  const { mentor_id } = req.params;
  
  db.query("DELETE FROM mentor WHERE mentor_id = ?", [mentor_id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error deleting mentor",
        error: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Mentor not found"
      });
    }
    
    res.json({
      message: "Mentor deleted successfully"
    });
  });
});

// Delete a project
router.delete("/projects/:project_id", (req, res) => {
  const { project_id } = req.params;
  
  db.query("DELETE FROM projects WHERE id = ?", [project_id], (err, result) => {
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

// Update project GitHub link
router.put("/projects/:project_id/github", (req, res) => {
  const { project_id } = req.params;
  const { github_link } = req.body;
  
  if (!github_link) {
    return res.status(400).json({
      message: "GitHub link is required"
    });
  }
  
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  const sql = `
    UPDATE projects 
    SET github_link = ?, last_updated = ?
    WHERE id = ?
  `;
  
  db.query(sql, [github_link, now, project_id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error updating GitHub link",
        error: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Project not found"
      });
    }
    
    res.json({
      message: "GitHub link updated successfully",
      updated_at: now
    });
  });
});

// Assign student to mentor
router.put("/assign-mentor", (req, res) => {
  const { student_id, mentor_id } = req.body;
  
  if (!student_id || !mentor_id) {
    return res.status(400).json({
      message: "Both student_id and mentor_id are required"
    });
  }
  
  db.query(
    "UPDATE student SET mentor_id = ? WHERE student_id = ?",
    [mentor_id, student_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Error assigning mentor",
          error: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Student not found"
        });
      }
      
      res.json({
        message: "Mentor assigned successfully"
      });
    }
  );
});

// Generate new credentials for a student
router.put("/reset-student-password/:student_id", (req, res) => {
  const { student_id } = req.params;
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({
      message: "New password is required"
    });
  }
  
  db.query(
    "UPDATE student SET password = ? WHERE student_id = ?",
    [password, student_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Error resetting password",
          error: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Student not found"
        });
      }
      
      res.json({
        message: "Student password reset successfully"
      });
    }
  );
});

// Generate new credentials for a mentor
router.put("/reset-mentor-password/:mentor_id", (req, res) => {
  const { mentor_id } = req.params;
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({
      message: "New password is required"
    });
  }
  
  db.query(
    "UPDATE mentor SET password = ? WHERE mentor_id = ?",
    [password, mentor_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Error resetting password",
          error: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Mentor not found"
        });
      }
      
      res.json({
        message: "Mentor password reset successfully"
      });
    }
  );
});

module.exports = router; 