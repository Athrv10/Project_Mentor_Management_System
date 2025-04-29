-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS project_mentor_management;

-- Use the database
USE project_mentor_management;

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS project_approvals;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS mentor;
DROP TABLE IF EXISTS admin;

-- Create admin table
CREATE TABLE admin (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL
);

-- Create mentor table
CREATE TABLE mentor (
  mentor_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  department VARCHAR(100)
);

-- Create student table
CREATE TABLE student (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  prn VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  mentor_id INT,
  github_link VARCHAR(255),
  FOREIGN KEY (mentor_id) REFERENCES mentor(mentor_id) ON DELETE SET NULL
);

-- Create projects table
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(10) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  student_id INT NOT NULL,
  mentor_id INT NOT NULL,
  status ENUM('Pending', 'Submitted', 'Approved', 'Rejected', 'In Progress', 'Completed') DEFAULT 'Pending',
  progress_percentage INT DEFAULT 0,
  mentor_feedback TEXT,
  github_link VARCHAR(255),
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES mentor(mentor_id) ON DELETE CASCADE
);

-- Create project approvals table
CREATE TABLE project_approvals (
  approval_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  mentor_id INT NOT NULL,
  approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  comments TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES mentor(mentor_id) ON DELETE CASCADE
);

-- Create messages table for conversations between mentors and students
CREATE TABLE messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  sender_type ENUM('student', 'mentor') NOT NULL,
  sender_id INT NOT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Insert sample admin data
INSERT INTO admin (name, username, password) VALUES
('Admin User', 'admin', 'admin123');

-- Insert sample mentor data
INSERT INTO mentor (name, email, password, department) VALUES
('Dr. Sharma', 'sharma@example.com', 'password123', 'Computer Science'),
('Prof. Patel', 'patel@example.com', 'password123', 'Information Technology'),
('Dr. Kumar', 'kumar@example.com', 'password123', 'Electronics');

-- Insert sample student data
INSERT INTO student (name, prn, email, password, mentor_id, github_link) VALUES
('Raj Verma', 'PRN001', 'raj@example.com', 'password123', 1, 'https://github.com/rajverma'),
('Priya Singh', 'PRN002', 'priya@example.com', 'password123', 1, 'https://github.com/priyasingh'),
('Amit Kumar', 'PRN003', 'amit@example.com', 'password123', 2, 'https://github.com/amitkumar'),
('Anita Desai', 'PRN004', 'anita@example.com', 'password123', 3, 'https://github.com/anitadesai'),
('Rahul Mehta', 'PRN005', 'rahul@example.com', 'password123', 2, 'https://github.com/rahulmehta');

-- Insert sample project data with sequential project IDs
INSERT INTO projects (project_id, title, description, student_id, mentor_id, status, progress_percentage, mentor_feedback, github_link) VALUES
('PRJ1001', 'Machine Learning App', 'A web application that uses machine learning to predict stock prices.', 1, 1, 'Approved', 40, 'Good progress so far, focus on improving the prediction accuracy.', 'https://github.com/rajverma/ml-app'),
('PRJ1002', 'IoT Smart Home', 'Smart home system using IoT devices for energy efficiency.', 2, 1, 'Approved', 0, 'Good project idea, please proceed with implementation.', NULL),
('PRJ1003', 'E-commerce Platform', 'Full-stack e-commerce website with payment integration.', 3, 2, 'In Progress', 65, 'UI looks good, need to improve backend security.', 'https://github.com/amitkumar/ecommerce-platform'),
('PRJ1004', 'Mobile Game Development', 'A multiplayer mobile game using Unity.', 4, 3, 'Approved', 25, 'Start implementing the multiplayer feature soon.', 'https://github.com/anitadesai/mobile-game'),
('PRJ1005', 'Data Visualization Tool', 'An interactive dashboard for visualizing large datasets.', 5, 2, 'Rejected', 0, 'The scope is too broad. Please narrow down the focus.', NULL);

-- Insert sample project approvals data
INSERT INTO project_approvals (project_id, mentor_id, approval_date, comments) VALUES
(1, 1, '2023-10-15 14:30:00', 'Project idea approved, good potential for implementation.'),
(4, 3, '2023-10-16 09:45:00', 'Approved with minor adjustments to project scope.');

-- Insert sample messages
INSERT INTO messages (project_id, sender_type, sender_id, message_text, is_read, sent_at) VALUES
(1, 'student', 1, 'Hello Dr. Sharma, I have completed the initial data collection for the ML app.', TRUE, '2023-10-18 09:15:00'),
(1, 'mentor', 1, 'Great work, Raj! Please start working on the model training next.', TRUE, '2023-10-18 10:30:00'),
(1, 'student', 1, 'I am facing some issues with the data preprocessing. Can we schedule a meeting?', FALSE, '2023-10-19 14:20:00'),
(2, 'mentor', 1, 'Priya, please start implementing the sensor integration for your IoT project.', TRUE, '2023-10-17 11:45:00'),
(2, 'student', 2, 'I will begin working on it today. Thank you for your guidance.', TRUE, '2023-10-17 13:10:00'); 