const { db } = require('./config/db');

// Query to get all projects
const query = `
  SELECT id, title, student_id, mentor_id, status
  FROM projects
  LIMIT 10
`;

db.query(query, (err, results) => {
  if (err) {
    console.error('Error querying projects:', err);
    process.exit(1);
  }
  
  console.log('Available projects:');
  console.table(results);
  
  // Close the database connection
  db.end(err => {
    if (err) {
      console.error('Error closing connection:', err);
      return;
    }
    console.log('Database connection closed');
  });
}); 