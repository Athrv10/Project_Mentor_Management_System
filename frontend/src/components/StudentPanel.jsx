import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Navbar from "./Navbar";
import ProjectSubmission from "./ProjectSubmission";
import ProjectDetails from "./ProjectDetails";
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import Grid from '@mui/joy/Grid';
import CircularProgress from '@mui/joy/CircularProgress';
import Alert from '@mui/joy/Alert';
import Sheet from '@mui/joy/Sheet';
import Divider from '@mui/joy/Divider';
import AspectRatio from '@mui/joy/AspectRatio';
import IconButton from '@mui/joy/IconButton';
import Badge from '@mui/joy/Badge';

const StudentPanel = () => {
  const [students, setStudents] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [updateStudent, setUpdateStudent] = useState({
    name: "",
    prn: "",
    email: "",
    password: "",
    mentor_id: "",
    github_link: "",
  });
  const [newStudent, setNewStudent] = useState({
    name: "",
    prn: "",
    email: "",
    password: "",
    mentor_id: "",
    github_link: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  // New project form states
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectGithubLink, setProjectGithubLink] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Add state for tracking feedback and notifications
  const [lastFeedbackCheck, setLastFeedbackCheck] = useState(Date.now());
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [feedbackNotificationVisible, setFeedbackNotificationVisible] = useState(false);

  useEffect(() => {
    // Check if user is authenticated as student
    const userType = localStorage.getItem('userType');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (userType !== 'student') {
      navigate('/');
      return;
    }
    
    setCurrentUser(userData);
    
    fetchStudents();
    fetchMentors();
    
    if (userData && userData.student_id) {
      fetchStudentProjects(userData.student_id);
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    // Navigate to login page
    navigate('/');
  };

  // Container styles
  const containerStyle = {
    backgroundColor: '#141414',
    color: '#fff',
    minHeight: '100vh',
  };

  const contentStyle = {
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

  const getMentorName = (mentorId) => {
    const mentor = mentors.find(m => m.mentor_id === mentorId);
    return mentor ? mentor.name : 'N/A';
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/student/student");
      setStudents(response.data);
    } catch (err) {
      alert(err.message);
      console.error("Error fetching students:", err);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/faculty");
      setMentors(response.data);
    } catch (err) {
      console.error("Error fetching mentors:", err);
    }
  };

  // Add function to check for new feedback
  const checkForNewFeedback = (projectsData) => {
    if (!projectsData || projectsData.length === 0) return;
    
    // Get the last check time from localStorage or use the current state
    const lastCheck = localStorage.getItem('lastFeedbackCheck') 
      ? parseInt(localStorage.getItem('lastFeedbackCheck')) 
      : lastFeedbackCheck;
    
    // Find projects with feedback that was updated after the last check
    const projectsWithNewFeedback = projectsData.filter(project => {
      if (!project.mentor_feedback) return false;
      
      // Parse the last_updated timestamp
      const feedbackTime = new Date(project.last_updated || project.submission_date).getTime();
      return feedbackTime > lastCheck;
    });
    
    // Update the notification state if there are new feedbacks
    if (projectsWithNewFeedback.length > 0) {
      setNewFeedbackCount(projectsWithNewFeedback.length);
      setFeedbackNotificationVisible(true);
      
      // Auto-hide the notification after 5 seconds
      setTimeout(() => {
        setFeedbackNotificationVisible(false);
      }, 5000);
    }
    
    // Update the last check time
    const now = Date.now();
    setLastFeedbackCheck(now);
    localStorage.setItem('lastFeedbackCheck', now.toString());
  };

  // Modify fetchStudentProjects to check for new feedback
  const fetchStudentProjects = async (studentId) => {
    try {
      setLoading(true);
      // Use specific endpoint that includes complete project details
      const response = await axios.get(`http://127.0.0.1:5000/projects/student/${studentId}`);
      
      // Log the response data to check the fields
      console.log("Project data from API:", response.data);
      
      // Process the data to ensure we have all required fields
      const processedData = response.data.map(project => ({
        ...project,
        // Ensure mentor_feedback is available or set to empty string
        mentor_feedback: project.mentor_feedback || '',
        // Set status to a default if not provided
        status: project.status || 'Pending',
        // Ensure progress percentage is available or default to 0
        progress_percentage: project.progress_percentage || 0
      }));
      
      // Check for new feedback
      checkForNewFeedback(processedData);
      
      setProjects(processedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching student projects:", err);
      setError(`Failed to load projects: ${err.message}`);
      setLoading(false);
    }
  };

  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:5000/student/add", newStudent);
      alert("Student added successfully.");
      fetchStudents();
      setNewStudent({ name: "", prn: "", email: "", password: "", mentor_id: "", github_link: "" });
    } catch (err) {
      alert(err.message);
      console.error("Error adding student:", err);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/student/${id}`);
      alert("Student deleted successfully.");
      fetchStudents();
    } catch (err) {
      alert(err.message);
      console.error("Error deleting student:", err);
    }
  };

  const openUpdateModal = (studentData) => {
    setSelectedStudentId(studentData.student_id);
    setUpdateStudent({ ...studentData });
    setIsUpdate(true);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:5000/student/${selectedStudentId}`, updateStudent);
      alert("Student updated successfully.");
      fetchStudents();
      
      // If the current user is updating their profile, update localStorage
      if (currentUser && currentUser.student_id === selectedStudentId) {
        const updatedUserData = { ...currentUser, ...updateStudent };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        setCurrentUser(updatedUserData);
      }
      
      setIsUpdate(false);
      setSelectedStudentId(null);
      setUpdateStudent({ name: "", prn: "", email: "", password: "", mentor_id: "", github_link: "" });
    } catch (err) {
      alert(err.message);
      console.error("Error updating student:", err);
    }
  };

  const handleUpdateGitHubLink = async () => {
    if (!currentUser || !currentUser.student_id || !updateStudent.github_link) {
      alert("Please enter a valid GitHub link");
      return;
    }
    
    try {
      await axios.put(`http://127.0.0.1:5000/student/${currentUser.student_id}/github`, {
        github_link: updateStudent.github_link
      });
      
      alert("GitHub link updated successfully");
      
      // Update current user in state and localStorage
      const updatedUserData = { ...currentUser, github_link: updateStudent.github_link };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setCurrentUser(updatedUserData);
      
      // Refresh student data
      fetchStudents();
      
    } catch (err) {
      alert(err.message || "Failed to update GitHub link");
      console.error("Error updating GitHub link:", err);
    }
  };

  const handleProjectSubmissionSuccess = () => {
    if (currentUser && currentUser.student_id) {
      fetchStudentProjects(currentUser.student_id);
    }
  };

  // Add a function to mark feedback as read when opening a project
  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
    
    // Mark this project's feedback as read by updating the last check time
    // Only if this project has feedback
    if (project.mentor_feedback) {
      const now = Date.now();
      setLastFeedbackCheck(now);
      localStorage.setItem('lastFeedbackCheck', now.toString());
      
      // Update the notification count
      if (newFeedbackCount > 0) {
        setNewFeedbackCount(prevCount => Math.max(0, prevCount - 1));
      }
    }
  };

  const closeUpdateModal = () => {
    setIsUpdate(false);
    setSelectedStudentId(null);
    setUpdateStudent({ name: "", prn: "", email: "", password: "", mentor_id: "", github_link: "" });
  };

  const netflixButtonStyle = {
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
  };

  const netflixInputStyle = {
    backgroundColor: '#222',
    color: '#fff',
    padding: '10px 15px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #444',
    outline: 'none',
  };

  const netflixTableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: '#1a1a1a',
    color: '#ddd',
    borderRadius: '5px',
    overflow: 'hidden', // To contain the border-radius of header/body
  };

  const netflixTableHeaderStyle = {
    backgroundColor: '#333',
    color: '#fff',
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '1px solid #555',
  };

  const netflixTableCellStyle = {
    padding: '10px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #444',
  };

  const netflixActionButtonStyle = {
    backgroundColor: '#444',
    color: '#fff',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginRight: '5px',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#666',
    },
  };

  const netflixModalStyle = {
    backgroundColor: '#141414',
    color: '#fff',
    padding: '20px',
    borderRadius: '5px',
  };

  const netflixModalTitleStyle = {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    marginBottom: '15px',
  };

  const renderProfileTab = () => {
    if (!currentUser) return <div style={cardStyle}>Loading user data...</div>;
    
    return (
      <div style={cardStyle}>
        <h3 style={{ color: '#e50914', marginBottom: '20px' }}>Your Profile</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px', color: '#aaa' }}>Name</div>
          <div style={{ fontSize: '18px' }}>{currentUser.name}</div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px', color: '#aaa' }}>PRN</div>
          <div style={{ fontSize: '18px' }}>{currentUser.prn}</div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px', color: '#aaa' }}>Email</div>
          <div style={{ fontSize: '18px' }}>{currentUser.email}</div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px', color: '#aaa' }}>Mentor</div>
          <div style={{ fontSize: '18px' }}>{getMentorName(currentUser.mentor_id)}</div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px', color: '#aaa' }}>GitHub Link</div>
          {currentUser.github_link ? (
            <div>
              <a 
                href={currentUser.github_link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#e50914', textDecoration: 'none' }}
              >
                {currentUser.github_link}
              </a>
            </div>
          ) : (
            <div>No GitHub link provided</div>
          )}
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ color: '#e50914', marginBottom: '15px' }}>Update GitHub Link</h4>
          <input
            type="text"
            placeholder="GitHub Profile URL"
            value={updateStudent.github_link || ''}
            onChange={(e) => setUpdateStudent(prev => ({ ...prev, github_link: e.target.value }))}
            style={netflixInputStyle}
          />
          <button onClick={handleUpdateGitHubLink} style={netflixButtonStyle}>
            Update GitHub Link
          </button>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => openUpdateModal(currentUser)} 
            style={netflixButtonStyle}
          >
            Edit Profile
          </button>
        </div>
      </div>
    );
  };

  const renderProjectsTab = () => {
    if (!currentUser) return <div style={cardStyle}>Loading user data...</div>;
    
    // Convert to using Material UI Joy components for consistency
    return (
      <>
        {feedbackNotificationVisible && (
          <Alert 
            color="primary" 
            variant="soft"
            sx={{ 
              mb: 2,
              animation: 'fadeIn 0.5s',
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'translateY(-20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            You have {newFeedbackCount} new feedback {newFeedbackCount === 1 ? 'message' : 'messages'} from your mentor!
          </Alert>
        )}
        
        {currentUser.mentor_id && (
          <ProjectSubmission 
            studentId={currentUser.student_id} 
            mentorId={currentUser.mentor_id}
            onSubmissionSuccess={handleProjectSubmissionSuccess}
          />
        )}
        
        <Card 
          sx={{ 
            bgcolor: '#222', 
            color: 'white', 
            mb: 3,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography level="h3" sx={{ color: '#e50914' }}>
                Your Projects
                {newFeedbackCount > 0 && (
                  <Badge 
                    badgeContent={newFeedbackCount} 
                    color="danger"
                    sx={{ ml: 2 }}
                  >
                    <Typography level="body-xs">New Feedback</Typography>
                  </Badge>
                )}
              </Typography>
              
              <Button 
                onClick={() => setShowCreateProjectModal(true)}
                sx={{ 
                  bgcolor: '#e50914',
                  color: 'white',
                  '&:hover': { bgcolor: '#b81d24' }
                }}
              >
                Create New Project
              </Button>
            </Box>
            
            {projects.length === 0 ? (
              <Typography sx={{ color: '#aaa' }}>
                You haven't submitted any projects yet.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {projects.map((project) => (
                  <Grid key={project.project_id} xs={12} md={6} lg={4}>
                    <Card 
                      sx={{ 
                        bgcolor: '#333', 
                        color: 'white',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
                        },
                        position: 'relative',
                        overflow: 'visible',
                        cursor: 'pointer',
                        height: '100%'
                      }}
                      onClick={() => openProjectDetails(project)}
                    >
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          bgcolor: getStatusColor(project.status),
                          color: 'white',
                          fontSize: '12px',
                          px: 1,
                          py: 0.5,
                          borderRadius: '4px',
                          textTransform: 'capitalize'
                        }}
                      >
                        {project.status?.replace('_', ' ') || 'Pending'}
                      </Box>
                      
                      <CardContent>
                        <Typography level="h5" sx={{ mb: 2, color: '#e50914' }}>
                          {project.title}
                        </Typography>
                        
                        <Typography sx={{ mb: 2, color: '#aaa', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Mentor: {project.mentor_name || 'Not assigned'}</span>
                          <span>{project.progress_percentage || 0}% Complete</span>
                        </Typography>
                        
                        <Box sx={{ width: '100%', bgcolor: '#444', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                          <Box
                            sx={{
                              width: `${project.progress_percentage || 0}%`,
                              bgcolor: '#e50914',
                              height: '100%'
                            }}
                          />
                        </Box>
                        
                        <Typography sx={{ 
                          mt: 2,
                          color: '#ccc',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          fontSize: '14px'
                        }}>
                          {project.description || 'No description provided.'}
                        </Typography>
                        
                        {project.mentor_feedback && (
                          <Box 
                            sx={{ 
                              mt: 2, 
                              p: 1, 
                              bgcolor: 'rgba(229, 9, 20, 0.1)', 
                              borderLeft: '3px solid #e50914',
                              borderRadius: '2px'
                            }}
                          >
                            <Typography level="body-sm" sx={{ color: '#e50914', mb: 0.5, fontWeight: 'bold' }}>
                              Mentor Feedback:
                            </Typography>
                            <Typography 
                              sx={{ 
                                color: '#ddd', 
                                fontSize: '13px',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {project.mentor_feedback}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </>
    );
  };

  // Add this function to get status color
  const getStatusColor = (status) => {
    if (!status) return '#777';
    
    const colors = {
      pending: '#777',
      approved: '#28a745',
      in_progress: '#007bff',
      review: '#f0ad4e',
      completed: '#28a745',
      rejected: '#dc3545'
    };
    
    return colors[status.toLowerCase()] || '#777';
  };

  const handleCreateProject = async () => {
    setFormError('');
    setFormSuccess('');
    
    if (!projectTitle.trim()) {
      setFormError('Project title is required');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (!currentUser || !currentUser.student_id) {
        throw new Error('User information not available');
      }
      
      const response = await axios.post('http://127.0.0.1:5000/projects', {
        title: projectTitle,
        description: projectDescription,
        github_link: projectGithubLink,
        student_id: currentUser.student_id,
        mentor_id: currentUser.mentor_id
      });
      
      setFormSuccess('Project created successfully!');
      setProjectTitle('');
      setProjectDescription('');
      setProjectGithubLink('');
      
      // Refresh the projects list
      fetchStudentProjects(currentUser.student_id);
      
      // Close the modal after 2 seconds
      setTimeout(() => {
        setShowCreateProjectModal(false);
        setFormSuccess('');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating project:', error);
      setFormError(error.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <Navbar />
      <div style={contentStyle}>
        <div style={headerStyle}>
          <h2 style={headingStyle}>Student Dashboard</h2>
          <button style={logoutButtonStyle} onClick={handleLogout}>
            Logout
          </button>
        </div>
        
        <div style={tabsContainerStyle}>
          <button 
            style={activeTab === 'profile' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('profile')}
          >
            Profile
            {activeTab === 'profile' && <div style={tabIndicatorStyle}></div>}
          </button>
          <button 
            style={activeTab === 'projects' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('projects')}
          >
            Projects
            {activeTab === 'projects' && <div style={tabIndicatorStyle}></div>}
          </button>
        </div>
        
        {activeTab === 'profile' ? renderProfileTab() : renderProjectsTab()}
        
        {isUpdate && (
          <Modal open={isUpdate} onClose={closeUpdateModal} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ModalDialog style={netflixModalStyle}>
              <ModalClose sx={{ color: '#fff' }} />
              <Typography level="h2" component="h2" style={netflixModalTitleStyle}>
                Update Profile
              </Typography>
              <form onSubmit={handleUpdateSubmit}>
                <input
                  type="text"
                  placeholder="Name"
                  value={updateStudent.name}
                  name="name"
                  onChange={handleUpdateChange}
                  style={netflixInputStyle}
                />
                <input
                  type="text"
                  placeholder="PRN"
                  value={updateStudent.prn}
                  name="prn"
                  onChange={handleUpdateChange}
                  style={netflixInputStyle}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={updateStudent.email}
                  name="email"
                  onChange={handleUpdateChange}
                  style={netflixInputStyle}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={updateStudent.password}
                  name="password"
                  onChange={handleUpdateChange}
                  style={netflixInputStyle}
                />
                <select
                  value={updateStudent.mentor_id || ''}
                  name="mentor_id"
                  onChange={handleUpdateChange}
                  style={netflixInputStyle}
                >
                  <option value="">Select Mentor</option>
                  {mentors.map((mentor) => (
                    <option key={mentor.mentor_id} value={mentor.mentor_id}>
                      {mentor.name} ({mentor.department})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="GitHub Link"
                  value={updateStudent.github_link || ''}
                  name="github_link"
                  onChange={handleUpdateChange}
                  style={netflixInputStyle}
                />
                <Button type="submit" style={netflixButtonStyle}>
                  Update Profile
                </Button>
              </form>
            </ModalDialog>
          </Modal>
        )}
        
        {isProjectModalOpen && selectedProject && (
          <Modal 
            open={isProjectModalOpen} 
            onClose={() => setIsProjectModalOpen(false)} 
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ModalDialog 
              sx={{ 
                maxWidth: '800px', 
                width: '100%', 
                bgcolor: '#222',
                border: '1px solid #333',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            >
              <ModalClose sx={{ color: '#aaa' }} />
              <ProjectDetails 
                projectId={selectedProject.id || selectedProject.project_id}
                userType="student"
                onUpdateSuccess={() => {
                  fetchStudentProjects(currentUser.student_id);
                  setIsProjectModalOpen(false);
                }}
              />
            </ModalDialog>
          </Modal>
        )}
        
        {/* Create Project Modal */}
        {showCreateProjectModal && (
          <Modal open={showCreateProjectModal} onClose={() => setShowCreateProjectModal(false)}>
            <ModalDialog 
              sx={{ 
                maxWidth: '600px',
                width: '100%',
                bgcolor: '#222',
                border: '1px solid #333',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            >
              <ModalClose sx={{ color: '#aaa' }} />
              <Typography level="h4" sx={{ mb: 3, color: '#e50914' }}>
                Create New Project
              </Typography>
              
              {formError && (
                <Alert color="danger" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              )}
              
              {formSuccess && (
                <Alert color="success" sx={{ mb: 2 }}>
                  {formSuccess}
                </Alert>
              )}
              
              <FormControl sx={{ mb: 2 }}>
                <FormLabel sx={{ color: '#aaa' }}>Project Title *</FormLabel>
                <Input 
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  sx={{ 
                    bgcolor: '#333',
                    color: 'white',
                    '&:focus': { borderColor: '#e50914' }
                  }}
                />
              </FormControl>
              
              <FormControl sx={{ mb: 2 }}>
                <FormLabel sx={{ color: '#aaa' }}>GitHub Link (Optional)</FormLabel>
                <Input 
                  value={projectGithubLink}
                  onChange={(e) => setProjectGithubLink(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  sx={{ 
                    bgcolor: '#333',
                    color: 'white',
                    '&:focus': { borderColor: '#e50914' }
                  }}
                />
              </FormControl>
              
              <FormControl sx={{ mb: 3 }}>
                <FormLabel sx={{ color: '#aaa' }}>Project Description</FormLabel>
                <Textarea 
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  minRows={3}
                  sx={{ 
                    bgcolor: '#333',
                    color: 'white',
                    '&:focus': { borderColor: '#e50914' }
                  }}
                />
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => setShowCreateProjectModal(false)}
                  variant="outlined"
                  sx={{ 
                    color: 'white',
                    borderColor: '#555',
                    '&:hover': { borderColor: '#777' }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateProject}
                  loading={submitting}
                  sx={{ 
                    bgcolor: '#e50914',
                    color: 'white',
                    '&:hover': { bgcolor: '#b81d24' }
                  }}
                >
                  Create Project
                </Button>
              </Box>
            </ModalDialog>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default StudentPanel;