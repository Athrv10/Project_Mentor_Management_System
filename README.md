# 📘 Project_Mentor_Management_System


A full-stack web application designed to simplify the management of student-mentor projects. It supports different user roles such as **Student**, **Mentor**, and **Admin**.

---

## 🚀 Features

- Role-based access control (Student, Mentor, Admin)
- Project creation, assignment, and status tracking
- Admin panel for managing users and allocations
- Intuitive UI for mentors and students
- MySQL backend with clear schema

---

## 🛠 Tech Stack

- **Frontend:** Reactjs ,HTML, CSS, JavaScript
- **Backend:** Node.js with Express
- **Database:** MySQL

---

## ⚙️ Prerequisites

- Node.js (v16 or higher)
- MySQL Server
- Modern web browser

---

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Athrv10/Project_Mentor_Management_System
cd mentor-project-management
```

### 2. Database Setup
```sql
CREATE DATABASE project_mentor_management;
```
Import schema:
```bash
mysql -u root -p project_mentor_management < backend/database_setup.sql
```

### 3. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file using the `.env.example` template and add DB credentials.

Start backend:
```bash
npm start
# Server runs on http://localhost:5000
```

### 4. Frontend Setup
```bash
cd frontend
# Open index.html directly or run a local server
```

---

## 📂 Project Structure

```
📦 backend/
📦 frontend/
📄 README.md
📄 architecture.mmd
📄 database_setup.sql
```

---

## 📌 License

This project is licensed under the MIT License. Feel free to use and adapt it.
