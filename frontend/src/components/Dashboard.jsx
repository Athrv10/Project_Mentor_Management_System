import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

const Dashboard = () => {
  const [studentsWithMentors, setStudentsWithMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated as admin
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchStudentsWithMentors();
  }, [navigate]);

  const fetchStudentsWithMentors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://127.0.0.1:5000/student/student");
      setStudentsWithMentors(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching students with mentors:", err);
      setError("Failed to fetch student data with mentor information.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    // Navigate to login page
    navigate('/');
  };

  const appStyle = {
    backgroundColor: '#141414',
    minHeight: '100vh',
    color: '#fff',
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const logoutButtonStyle = {
    padding: '10px 15px',
    backgroundColor: '#e50914',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  if (loading) {
    return (
      <div style={appStyle}>
        <Navbar />
        <div style={containerStyle}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <div>Loading student data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={appStyle}>
        <Navbar />
        <div style={containerStyle}>
          <div style={{ color: '#e50914', padding: '20px' }}>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={appStyle}>
      <Navbar />
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2>Admin Dashboard - Student Data</h2>
          <button style={logoutButtonStyle} onClick={handleLogout}>
            Logout
          </button>
        </div>
        
        <style>
          {`
            table {
              border-collapse: collapse;
              width: 100%;
              border: 1px solid #333;
              margin-top: 20px;
              color: #fff;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            th, td {
              border: 1px solid #333;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #333;
              font-weight: bold;
            }
            tr:hover {
              background-color: #2a2a2a;
            }
          `}
        </style>
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>PRN</th>
              <th>Email</th>
              <th>Mentor Name</th>
              <th>Mentor ID</th>
            </tr>
          </thead>
          <tbody>
            {studentsWithMentors.map((student) => (
              <tr key={student.student_id}>
                <td>{student.student_id}</td>
                <td>{student.student_name}</td>
                <td>{student.prn}</td>
                <td>{student.student_email}</td>
                <td>{student.mentor_name || 'No Mentor'}</td>
                <td>{student.mentor_id || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;