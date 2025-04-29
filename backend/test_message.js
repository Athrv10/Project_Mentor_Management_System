const { db } = require('./config/db');

// Insert a test message with valid IDs from our database
const projectId = 17; // Use an existing project ID from check_projects.js results
const senderType = 'mentor';
const senderId = 4; // Use the mentor_id from the project
const messageText = 'This is a test message from the system';

const insertQuery = `
  INSERT INTO messages (project_id, sender_type, sender_id, message_text)
  VALUES (?, ?, ?, ?)
`;

db.query(insertQuery, [projectId, senderType, senderId, messageText], (err, result) => {
  if (err) {
    console.error('Error inserting test message:', err);
    process.exit(1);
  }
  
  console.log('Test message inserted successfully with ID:', result.insertId);
  
  // Now retrieve the message to verify
  const selectQuery = `
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
  
  db.query(selectQuery, [result.insertId], (err, messages) => {
    if (err) {
      console.error('Error retrieving test message:', err);
      process.exit(1);
    }
    
    console.log('Retrieved test message:', messages[0]);
    
    // Close the database connection
    db.end(err => {
      if (err) {
        console.error('Error closing connection:', err);
        return;
      }
      console.log('Database connection closed');
    });
  });
}); 