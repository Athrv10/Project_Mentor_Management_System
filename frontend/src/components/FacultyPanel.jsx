import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import ProjectDetails from "./ProjectDetails";

const FacultyPanel = () => {
  const [faculty, setFaculty] = useState([]);
  const [facultyId, setFacultyId] = useState("");
  const [name, setName] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [studentProjects, setStudentProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated as mentor
    const userType = localStorage.getItem('userType');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (userType !== 'mentor') {
      navigate('/');
      return;
    }
    
    setCurrentUser(userData);
    
    if (userData && userData.mentor_id) {
      fetchAssignedStudents(userData.mentor_id);
      fetchMentorProjects(userData.mentor_id);
    }
    
    fetchFaculty();
  }, [navigate]);

  const fetchAssignedStudents = async (mentorId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/faculty/${mentorId}/students`);
      setAssignedStudents(response.data);
    } catch (error) {
      console.error("Error fetching assigned students:", error);
    }
  };

  const fetchMentorProjects = async (mentorId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/projects/mentor/${mentorId}`);
      setStudentProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    // Navigate to login page
    navigate('/');
  };

  const panelStyle = {
    backgroundColor: '#141414',
    color: '#fff',
    minHeight: '100vh',
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

  const headingStyle = {
    color: '#fff',
    margin: 0,
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

  const tabsContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid #333',
    marginBottom: '30px',
  };

  const tabStyle = {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    color: '#aaa',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    position: 'relative',
  };

  const activeTabStyle = {
    ...tabStyle,
    color: '#fff',
  };

  const tabIndicatorStyle = {
    position: 'absolute',
    bottom: '-1px',
    left: '0',
    width: '100%',
    height: '3px',
    backgroundColor: '#e50914',
  };

  const cardStyle = {
    backgroundColor: '#222',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  };

  const inputStyle = {
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px 15px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #444',
    outline: 'none',
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
  };

  const addButton = {
    backgroundColor: '#e50914',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#b81d24',
    },
    marginBottom: '20px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: '#1a1a1a',
    color: '#ddd',
    borderRadius: '5px',
    overflow: 'hidden',
  };

  const tableHeaderStyle = {
    backgroundColor: '#333',
    color: '#fff',
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '1px solid #555',
  };

  const tableCellStyle = {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #444',
  };

  const actionButtonStyle = {
    backgroundColor: '#444',
    color: '#fff',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginRight: '5px',
    transition: 'background-color 0.3s ease',
  };

  const modalStyle = {
    backgroundColor: '#141414',
    color: '#fff',
    padding: '20px',
    borderRadius: '5px',
    maxWidth: '800px',
    width: '90%',
  };

  const fetchFaculty = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/faculty");
      setFaculty(response.data);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching faculty:", error);
    }
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const handleProjectUpdateSuccess = () => {
    if (currentUser && currentUser.mentor_id) {
      fetchMentorProjects(currentUser.mentor_id);
    }
  };

  const addFaculty = async () => {
    if (!name || !facultyId) {
      alert("Enter all details");
      return;
    }
    try {
      await axios.post("http://localhost:5000/faculty", { faculty_id: facultyId, name });
      fetchFaculty();
      setName("");
      setFacultyId("");
    } catch (error) {
      alert(error.message);
      console.error("Error adding faculty:", error);
    }
  };

  const renderStudentsTab = () => {
    return (
      <div style={cardStyle}>
        <h3 style={{ color: '#e50914', marginBottom: '20px' }}>Your Assigned Students</h3>
        
        {assignedStudents.length === 0 ? (
          <div>No students assigned to you yet.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Student Name</th>
                <th style={tableHeaderStyle}>PRN</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>GitHub Link</th>
                <th style={tableHeaderStyle}>Project Status</th>
              </tr>
            </thead>
            <tbody>
              {assignedStudents.map((student) => (
                <tr key={student.student_id}>
                  <td style={tableCellStyle}>{student.name}</td>
                  <td style={tableCellStyle}>{student.prn}</td>
                  <td style={tableCellStyle}>{student.email}</td>
                  <td style={tableCellStyle}>
                    {student.github_link ? (
                      <a 
                        href={student.github_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#e50914' }}
                      >
                        View GitHub
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {student.project_title ? (
                      <span>
                        {student.project_status} ({student.progress_percentage}%)
                      </span>
                    ) : (
                      'No project'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderProjectsTab = () => {
    return (
      <div style={cardStyle}>
        <h3 style={{ color: '#e50914', marginBottom: '20px' }}>Student Projects</h3>
        
        {studentProjects.length === 0 ? (
          <div>No projects submitted by your students yet.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Project Title</th>
                <th style={tableHeaderStyle}>Student</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Progress</th>
                <th style={tableHeaderStyle}>GitHub</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentProjects.map((project) => (
                <tr key={project.project_id}>
                  <td style={tableCellStyle}>{project.title}</td>
                  <td style={tableCellStyle}>{project.student_name}</td>
                  <td style={tableCellStyle}>{project.status}</td>
                  <td style={tableCellStyle}>{project.progress_percentage}%</td>
                  <td style={tableCellStyle}>
                    {project.github_link ? (
                      <a 
                        href={project.github_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#e50914' }}
                      >
                        View GitHub
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    <button 
                      onClick={() => openProjectDetails(project)} 
                      style={actionButtonStyle}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div style={panelStyle}>
      <Navbar />
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={headingStyle}>Mentor Dashboard</h2>
          <button style={logoutButtonStyle} onClick={handleLogout}>
            Logout
          </button>
        </div>
        
        <div style={tabsContainerStyle}>
          <button 
            style={activeTab === 'students' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('students')}
          >
            My Students
            {activeTab === 'students' && <div style={tabIndicatorStyle}></div>}
          </button>
          <button 
            style={activeTab === 'projects' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('projects')}
          >
            Projects
            {activeTab === 'projects' && <div style={tabIndicatorStyle}></div>}
          </button>
        </div>
        
        {activeTab === 'students' ? renderStudentsTab() : renderProjectsTab()}
        
        {isProjectModalOpen && selectedProject && (
          <Modal 
            open={isProjectModalOpen} 
            onClose={() => setIsProjectModalOpen(false)} 
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ModalDialog style={modalStyle}>
              <ModalClose sx={{ color: '#fff' }} />
              <ProjectDetails 
                projectId={selectedProject.project_id}
                userType="mentor"
                onUpdateSuccess={() => {
                  handleProjectUpdateSuccess();
                  setIsProjectModalOpen(false);
                }}
              />
            </ModalDialog>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default FacultyPanel;