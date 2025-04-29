-- Use the database
USE project_mentor_management;

-- Update projects table to use VARCHAR for project_id if it doesn't already
ALTER TABLE projects MODIFY COLUMN project_id VARCHAR(10) NOT NULL;

-- Add UNIQUE constraint to project_id if it doesn't exist
-- This might fail if the constraint already exists, which is fine
ALTER TABLE projects ADD CONSTRAINT uc_project_id UNIQUE (project_id);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  sender_type ENUM('student', 'mentor') NOT NULL,
  sender_id INT NOT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Sample data for messages table if needed
-- Only insert if there are no messages yet
INSERT INTO messages (project_id, sender_type, sender_id, message_text, is_read, sent_at)
SELECT 1, 'student', 1, 'Hello Dr. Sharma, I have completed the initial data collection for the ML app.', TRUE, '2023-10-18 09:15:00'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM messages LIMIT 1);

INSERT INTO messages (project_id, sender_type, sender_id, message_text, is_read, sent_at)
SELECT 1, 'mentor', 1, 'Great work, Raj! Please start working on the model training next.', TRUE, '2023-10-18 10:30:00'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM messages LIMIT 1);

INSERT INTO messages (project_id, sender_type, sender_id, message_text, is_read, sent_at)
SELECT 1, 'student', 1, 'I am facing some issues with the data preprocessing. Can we schedule a meeting?', FALSE, '2023-10-19 14:20:00'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM messages LIMIT 1);

-- Fix any existing projects with numeric IDs by adding the PRJ prefix
UPDATE projects SET project_id = CONCAT('PRJ', project_id) WHERE project_id NOT LIKE 'PRJ%' AND project_id REGEXP '^[0-9]+$';

-- Insert additional sample messages for other projects if no messages exist
INSERT INTO messages (project_id, sender_type, sender_id, message_text, is_read, sent_at)
SELECT 2, 'mentor', 1, 'Priya, please start implementing the sensor integration for your IoT project.', TRUE, '2023-10-17 11:45:00'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM messages LIMIT 1);

INSERT INTO messages (project_id, sender_type, sender_id, message_text, is_read, sent_at)
SELECT 2, 'student', 2, 'I will begin working on it today. Thank you for your guidance.', TRUE, '2023-10-17 13:10:00'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM messages LIMIT 1); 