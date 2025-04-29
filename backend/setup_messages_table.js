const fs = require('fs');
const path = require('path');
const { db } = require('./config/db');

// Read the SQL file
const sqlFile = path.join(__dirname, 'config', 'messages_schema.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Split SQL statements
const statements = sql
  .replace(/(\r\n|\n|\r)/gm, ' ') // Remove newlines
  .replace(/\s+/g, ' ') // Replace multiple spaces with single space
  .split(';') // Split on semicolons
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0); // Remove empty statements

// Execute each statement
console.log('Setting up messages table...');
statements.forEach(statement => {
  db.query(statement, (err, results) => {
    if (err) {
      console.error('Error executing SQL:', err);
      console.error('Statement:', statement);
      return;
    }
    console.log('SQL executed successfully:', statement.substring(0, 50) + '...');
  });
});

// Close the connection after all queries are executed
setTimeout(() => {
  db.end(err => {
    if (err) {
      console.error('Error closing connection:', err);
      return;
    }
    console.log('Database connection closed');
  });
}, 1000);

console.log('Messages table setup complete!'); 