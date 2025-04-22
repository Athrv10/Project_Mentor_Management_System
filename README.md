# Mentor Project Management System

A web application for managing mentor-student projects with different user roles (student, mentor, admin).

## Prerequisites

- Node.js (v16+)
- MySQL database server
- Web browser

## Setup Instructions

### Database Setup

1. Install MySQL on your system if not already installed
2. Create a new database named `project_mentor_management`:
   ```sql
   CREATE DATABASE project_mentor_management;
   ```
3. Import the database schema using the SQL file:
   ```
   mysql -u root -p project_mentor_management < backend/database_setup.sql
   ```
   
### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables in `.env` file (already created)
4. Start the backend server:
   ```
   npm start
   ```
   The backend server will start running on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend[1]/frontend/client
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend development server:
   ```
   npm run dev
   ```
   The frontend will be accessible at http://localhost:5173

## Running the Application

### Using Start Scripts

For Windows:
```
start.bat
```

For Linux/Mac:
```
./start.sh
```

### Login Information

- **Admin:**
  - Username: admin@example.com
  - Password: admin123

- **Mentor:**
  - Username: mentor@example.com
  - Password: mentor123

- **Student:**
  - Username: student@example.com
  - Password: student123

## Features

- **Student Panel:** 
  - Submit project proposals
  - Add GitHub repository links to projects
  - Track project approval status and feedback

- **Mentor Panel:** 
  - Review student projects and provide feedback
  - Approve or reject project ideas
  - View GitHub repositories for approved projects
  - Track student progress through project milestones

- **Admin Panel:** 
  - View all students, mentors, and projects in the system
  - Add and delete students and mentors
  - Assign mentors to students
  - Reset credentials for students and mentors
  - Monitor all projects and their statuses
  - Oversee the entire project management process

## Project Workflow

1. **Student** submits a project proposal with title and description
2. **Mentor** reviews the proposal and either approves or rejects it with feedback
3. When approved, the **Student** can add their GitHub repository link
4. **Mentor** can access the GitHub repository to monitor progress
5. **Student** updates project progress and milestones
6. **Mentor** provides ongoing feedback

## Troubleshooting

- If the backend fails to connect to the database, check your MySQL configuration in the `.env` file
- Make sure both frontend and backend ports (5173 and 5000) are available
- For any issues with node modules, try deleting the node_modules folder and running `npm install` again

## Project Structure

- **Frontend**: React.js application with login pages for admin, mentor, and student
- **Backend**: Express.js API with MySQL database

## API Endpoints

### Admin
- POST `/admin/login` - Admin login
- GET `/admin` - Get all admins
- POST `/admin` - Add a new admin

### Faculty
- POST `/faculty/login` - Faculty login
- GET `/faculty` - Get all faculty
- POST `/faculty` - Add a new faculty member
- DELETE `/faculty/:mentor_id` - Delete a faculty member
- PUT `/faculty/:mentor_id` - Update a faculty member
- GET `/faculty/:mentor_id` - Get a faculty member by ID

### Student
- POST `/student/login` - Student login
- GET `/student/student` - Get all students
- POST `/student/add` - Add a new student
- PUT `/student/:student_id` - Update a student
- DELETE `/student/:student_id` - Delete a student
- GET `/student/:student_id` - Get a student by ID 
