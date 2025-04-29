const mysql = require("mysql");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Atharv@123",
  database: process.env.DB_NAME || "project_mentor_management",
  port: process.env.DB_PORT || 3306
});

const dbConnection = () => {
  db.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err);
      return;
    }
    console.log("Connected to MySQL database");
  });
};

module.exports = { db, dbConnection };