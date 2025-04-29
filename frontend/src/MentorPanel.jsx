import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sheet, Typography, Button, Table, Divider, Chip, Modal, ModalDialog, Link, Box, Stack, IconButton, Tooltip, Grid, Textarea } from '@mui/joy';
import MessageChat from './components/MessageChat';
import ChatIcon from '@mui/icons-material/Chat';

const MentorPanel = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [userId, setUserId] = useState(null);
  const [feedback, setFeedback] = useState('');
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    setUserId(userData.id || userData.mentor_id);
    fetchMentorProjects();
  }, []);
  
  const fetchMentorProjects = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const response = await axios.get(`http://127.0.0.1:5000/faculty/projects/${userData.id}`);
      
      // Get the student IDs from projects to fetch their GitHub links
      const studentIds = response.data.map(project => project.student_id);
      
      // Fetch students details to get GitHub links
      const uniqueStudentIds = [...new Set(studentIds)];
      const studentsResponse = await axios.get(`http://127.0.0.1:5000/faculty/${userData.id}/students`);
      
      // Create a map of student ID to GitHub link
      const studentGitHubMap = {};
      studentsResponse.data.forEach(student => {
        studentGitHubMap[student.student_id] = student.github_link;
      });
      
      // Map student GitHub links to projects
      const projectsWithGitHub = response.data.map(project => {
        return {
          ...project,
          student_github_link: studentGitHubMap[project.student_id] || null
        };
      });
      
      setProjects(projectsWithGitHub);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };
  
  const handleAction = (project, action) => {
    setSelectedProject(project);
    setActionType(action);
    setActionModalOpen(true);
  };
  
  const submitAction = async () => {
    try {
      if (!selectedProject) return;
      
      // Clear any previous error messages
      setError('');
      setActionSuccess('');
      setSubmitting(true);
      
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      // Different endpoint based on action type
      let endpoint;
      let payload;
      
      if (actionType === 'approve' || actionType === 'reject') {
        // For status changes (approve/reject)
        endpoint = `http://127.0.0.1:5000/faculty/projects/${selectedProject.id}/status`;
        payload = {
          mentor_id: userData.id,
          status: actionType === 'approve' ? 'Approved' : 'Rejected',
          feedback: feedback
        };
      } else if (actionType === 'feedback') {
        // For feedback-only updates
        endpoint = `http://127.0.0.1:5000/projects/${selectedProject.id}`;
        payload = {
          mentor_feedback: feedback
        };
      }
      
      console.log("Sending request to:", endpoint);
      console.log("With payload:", payload);
      
      const response = await axios.put(endpoint, payload);
      
      if (response.status === 200) {
        // Set success message based on action type
        setActionSuccess(
          actionType === 'approve' ? 'Project approved successfully!' :
          actionType === 'reject' ? 'Project rejected successfully!' :
          'Feedback provided successfully!'
        );
        
        // Update the project status locally
        setProjects(projects.map(project => 
          project.id === selectedProject.id 
            ? { 
                ...project, 
                status: actionType === 'approve' ? 'Approved' : 
                       actionType === 'reject' ? 'Rejected' : 
                       project.status,
                mentor_feedback: feedback
              } 
            : project
        ));
        
        // Close modal after a short delay to show success message
        setTimeout(() => {
          setActionModalOpen(false);
          setSelectedProject(null);
          setFeedback('');
          setActionSuccess('');
          
          // Refresh projects data
          fetchMentorProjects();
        }, 1500);
      }
      
    } catch (err) {
      console.error('Error updating project:', err);
      setError(`Failed to update project: ${err.message}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };
  
  const openChatModal = (project) => {
    setSelectedProject(project);
    setChatModalOpen(true);
  };

  const handleProvideFeedback = (project) => {
    setSelectedProject(project);
    setActionType('feedback');
    setActionModalOpen(true);
  };
  
  return (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: '1200px',
        mx: 'auto',
        my: 4,
        p: 3,
        borderRadius: 'md',
        bgcolor: '#181818',
        color: 'white'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="h3" sx={{ color: 'white' }}>Mentor Dashboard</Typography>
        <Button 
          color="danger" 
          onClick={handleLogout}
          sx={{ bgcolor: '#e50914', '&:hover': { bgcolor: '#b2070e' } }}
        >
          Logout
        </Button>
      </Box>
      <Divider sx={{ my: 2, borderColor: '#333' }} />
      
      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#300', borderRadius: 'md' }}>
          <Typography color="danger">{error}</Typography>
        </Box>
      )}
      
      {loading ? (
        <Typography sx={{ color: '#ccc' }}>Loading projects...</Typography>
      ) : projects.length === 0 ? (
        <Typography sx={{ color: '#ccc' }}>No projects assigned yet.</Typography>
      ) : (
        <Table
          sx={{
            '& th': { color: '#ccc', borderBottom: '1px solid #333' },
            '& td': { color: 'white', py: 1.5, borderBottom: '1px solid #333' }
          }}
        >
          <thead>
            <tr>
              <th>Project Title</th>
              <th>Student</th>
              <th>Status</th>
              <th>GitHub Link</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.title}</td>
                <td>{project.students}</td>
                <td>
                  <Chip 
                    color={
                      project.status === 'Approved' ? 'success' : 
                      project.status === 'Rejected' ? 'danger' :
                      project.status === 'In Progress' ? 'primary' : 'warning'
                    }
                    sx={{
                      bgcolor: project.status === 'Approved' ? '#117700' : 
                             project.status === 'Rejected' ? '#770000' :
                             project.status === 'In Progress' ? '#005599' : '#775500'
                    }}
                  >
                    {project.status}
                  </Chip>
                </td>
                <td>
                  {project.github_link ? (
                    <Link href={project.github_link} target="_blank" rel="noopener" sx={{ color: '#3399ff' }}>
                      View Repository
                    </Link>
                  ) : (
                    <Typography level="body-sm" sx={{ color: '#888' }}>
                      Not provided yet
                    </Typography>
                  )}
                </td>
                <td>{new Date(project.updated_at).toLocaleDateString()}</td>
                <td>
                  <Button 
                    size="sm" 
                    color="primary"
                    sx={{ mr: 1, bgcolor: '#2979ff', '&:hover': { bgcolor: '#1c54b2' } }}
                    onClick={() => openChatModal(project)}
                    startDecorator={<ChatIcon />}
                  >
                    Messages
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outlined"
                    color="neutral"
                    onClick={() => handleProvideFeedback(project)}
                    sx={{ color: '#ccc', borderColor: '#444' }}
                  >
                    Provide Feedback
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Action Modal for Approve/Reject/Feedback */}
      <Modal open={actionModalOpen} onClose={() => !submitting && setActionModalOpen(false)}>
        <ModalDialog
          aria-labelledby="action-modal-title"
          sx={{ maxWidth: 500, bgcolor: '#222', color: 'white' }}
        >
          <Typography id="action-modal-title" level="h4" sx={{ color: 'white' }}>
            {actionType === 'approve' ? 'Approve Project' : 
             actionType === 'reject' ? 'Reject Project' : 
             'Provide Feedback'}
          </Typography>
          
          <Divider sx={{ my: 2, borderColor: '#444' }} />
          
          {actionSuccess && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#003300', borderRadius: 'md' }}>
              <Typography sx={{ color: '#00cc00' }}>
                {actionSuccess}
              </Typography>
            </Box>
          )}
          
          {error && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#330000', borderRadius: 'md' }}>
              <Typography sx={{ color: '#ff5555' }}>
                {error}
              </Typography>
            </Box>
          )}
          
          {selectedProject && (
            <Box sx={{ mb: 2 }}>
              <Typography level="body-lg" fontWeight="bold" sx={{ color: 'white' }}>
                Project: {selectedProject.title}
              </Typography>
              <Typography level="body-sm" sx={{ color: '#ccc' }}>
                Student: {selectedProject.students}
              </Typography>
              {selectedProject.student_email && (
                <Typography level="body-sm" sx={{ color: '#ccc' }}>
                  Email: <Link href={`mailto:${selectedProject.student_email}`} sx={{ color: '#3399ff' }}>
                    {selectedProject.student_email}
                  </Link>
                </Typography>
              )}
              
              {(actionType === 'approve' || actionType === 'reject') && (
                <Typography level="body-md" sx={{ mt: 2, color: '#ccc' }}>
                  Are you sure you want to {actionType} this project?
                </Typography>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Typography level="body-sm" sx={{ mb: 1, color: '#ccc' }}>
                  {actionType === 'feedback' ? 'Feedback:' : 'Feedback (optional):'}
                </Typography>
                <Textarea
                  placeholder="Add feedback for the student..."
                  minRows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  sx={{ 
                    width: '100%',
                    bgcolor: '#333',
                    color: 'white',
                    border: '1px solid #444',
                    '&:focus': {
                      borderColor: '#777'
                    }
                  }}
                />
              </Box>
            </Box>
          )}
          
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setActionModalOpen(false)}
              disabled={submitting || !!actionSuccess}
              sx={{ color: '#ccc' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitAction}
              color={
                actionType === 'approve' ? 'success' : 
                actionType === 'reject' ? 'danger' : 
                'primary'
              }
              loading={submitting}
              disabled={!!actionSuccess}
              sx={{ 
                bgcolor: actionType === 'approve' ? '#117700' : 
                        actionType === 'reject' ? '#770000' : 
                        '#2979ff',
                '&:hover': {
                  bgcolor: actionType === 'approve' ? '#0d5500' : 
                          actionType === 'reject' ? '#550000' : 
                          '#1c54b2'
                }
              }}
            >
              {actionType === 'approve' ? 'Approve' : 
               actionType === 'reject' ? 'Reject' : 
               'Submit Feedback'}
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
      
      {/* Chat Modal */}
      <Modal 
        open={chatModalOpen} 
        onClose={() => setChatModalOpen(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ModalDialog
          aria-labelledby="chat-modal-title"
          sx={{ 
            maxWidth: 700,
            maxHeight: '90vh',
            width: '100%', 
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: '#222',
            color: 'white',
            p: 0
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography id="chat-modal-title" level="h4" sx={{ color: 'white' }}>
              Project Messages
            </Typography>
            
            <Divider sx={{ my: 2, borderColor: '#444' }} />
            
            {selectedProject && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid xs={12} md={7}>
                    <Typography level="body-lg" fontWeight="bold" sx={{ color: 'white' }}>
                      {selectedProject.title}
                    </Typography>
                    <Typography level="body-sm" sx={{ color: '#ccc', mb: 1 }}>
                      Student: {selectedProject.students}
                    </Typography>
                    <Typography level="body-sm" sx={{ color: '#ccc' }}>
                      Status: <Chip 
                        size="sm" 
                        color={
                          selectedProject.status === 'Approved' ? 'success' : 
                          selectedProject.status === 'Rejected' ? 'danger' :
                          selectedProject.status === 'In Progress' ? 'primary' : 'warning'
                        }
                        sx={{
                          ml: 0.5,
                          bgcolor: selectedProject.status === 'Approved' ? '#117700' : 
                                 selectedProject.status === 'Rejected' ? '#770000' :
                                 selectedProject.status === 'In Progress' ? '#005599' : '#775500'
                        }}
                      >
                        {selectedProject.status}
                      </Chip>
                    </Typography>
                  </Grid>
                  <Grid xs={12} md={5}>
                    <Box sx={{ 
                      p: 1, 
                      bgcolor: '#333', 
                      borderRadius: 'md',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5
                    }}>
                      <Typography level="body-sm" fontWeight="bold" sx={{ color: '#ccc' }}>Contact:</Typography>
                      <Typography level="body-sm" sx={{ color: '#ccc' }}>
                        <Link href={`mailto:${selectedProject.student_email}`} sx={{ color: '#3399ff' }}>
                          {selectedProject.student_email}
                        </Link>
                      </Typography>
                      {selectedProject.github_link && (
                        <Typography level="body-sm" sx={{ color: '#ccc' }}>
                          <Link href={selectedProject.github_link} target="_blank" sx={{ color: '#3399ff' }}>
                            Project Repository
                          </Link>
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
          
          {selectedProject && (
            <Box sx={{ height: 450, flexGrow: 1 }}>
              <MessageChat
                projectId={selectedProject.id}
                userId={userId}
                userType="mentor"
                embedded={true}
              />
            </Box>
          )}
        </ModalDialog>
      </Modal>
    </Sheet>
  );
};

export default MentorPanel; 