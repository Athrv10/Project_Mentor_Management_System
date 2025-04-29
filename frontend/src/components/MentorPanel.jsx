import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sheet, Typography, Button, Table, Divider, Chip, Modal, ModalDialog, Link, Box, Textarea, FormControl, FormLabel, Stack } from '@mui/joy';

const MentorPanel = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [actionType, setActionType] = useState('');
  
  useEffect(() => {
    fetchMentorProjects();
  }, []);
  
  const fetchMentorProjects = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const response = await axios.get(`http://127.0.0.1:5000/faculty/projects/${userData.id}`);
      setProjects(response.data);
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
    setFeedback('');
    setActionModalOpen(true);
  };
  
  const submitAction = async () => {
    try {
      if (!selectedProject) return;
      
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      // If it's just providing feedback, use a different endpoint that only updates feedback
      if (actionType === 'feedback') {
        const feedbackEndpoint = `http://127.0.0.1:5000/projects/${selectedProject.id}`;
        const feedbackPayload = {
          mentor_feedback: feedback
        };
        
        await axios.put(feedbackEndpoint, feedbackPayload);
      } else {
        // For approve/reject actions, use the status update endpoint
        const endpoint = `http://127.0.0.1:5000/faculty/projects/${selectedProject.id}/status`;
        
        const payload = {
          mentor_id: userData.id,
          status: actionType === 'approve' ? 'Approved' : 'Rejected',
          feedback: feedback
        };
        
        await axios.put(endpoint, payload);
        
        // Update the project status locally only for approve/reject actions
        setProjects(projects.map(project => 
          project.id === selectedProject.id 
            ? { ...project, status: actionType === 'approve' ? 'Approved' : 'Rejected' } 
            : project
        ));
      }
      
      setActionModalOpen(false);
      setSelectedProject(null);
      setFeedback('');
      
      // Refresh projects data
      fetchMentorProjects();
      
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project. Please try again.');
    }
  };
  
  const containerStyle = {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  };
  
  return (
    <div style={containerStyle}>
      <Sheet sx={{ p: 4, borderRadius: 'md', mb: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Typography level="h3">Mentor Dashboard</Typography>
          <Button color="danger" onClick={handleLogout}>Logout</Button>
        </div>
        <Divider sx={{ my: 2 }} />
        
        {loading ? (
          <Typography>Loading projects...</Typography>
        ) : error ? (
          <Typography color="danger">{error}</Typography>
        ) : projects.length === 0 ? (
          <Typography>No projects assigned yet.</Typography>
        ) : (
          <Table>
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
                    >
                      {project.status}
                    </Chip>
                  </td>
                  <td>
                    {project.github_link ? (
                      <Link href={project.github_link} target="_blank" rel="noopener">
                        View Repository
                      </Link>
                    ) : (
                      <Typography level="body-sm" color="neutral">
                        Not provided yet
                      </Typography>
                    )}
                  </td>
                  <td>{new Date(project.updated_at).toLocaleDateString()}</td>
                  <td>
                    {(project.status === 'Pending' || project.status === 'Submitted') && (
                      <>
                        <Button 
                          size="sm" 
                          color="success" 
                          sx={{ mr: 1, mb: 1 }}
                          onClick={() => handleAction(project, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          color="danger"
                          sx={{ mb: 1 }}
                          onClick={() => handleAction(project, 'reject')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {project.status === 'Approved' && (
                      <Button 
                        size="sm" 
                        color="primary"
                        onClick={() => handleAction(project, 'feedback')}
                      >
                        Provide Feedback
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Sheet>
      
      {/* Action Modal */}
      <Modal open={actionModalOpen} onClose={() => setActionModalOpen(false)}>
        <ModalDialog
          aria-labelledby="action-modal-title"
          sx={{ maxWidth: 500 }}
        >
          <Typography id="action-modal-title" level="h4">
            {actionType === 'approve' ? 'Approve Project' : 
             actionType === 'reject' ? 'Reject Project' : 'Provide Feedback'}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {selectedProject && (
            <Box sx={{ mb: 2 }}>
              <Typography level="body-lg" fontWeight="bold">
                Project: {selectedProject.title}
              </Typography>
              <Typography level="body-sm">
                Student: {selectedProject.students}
              </Typography>
            </Box>
          )}
          
          <FormControl>
            <FormLabel>Feedback for student</FormLabel>
            <Textarea
              placeholder="Enter your feedback..."
              minRows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              sx={{ mb: 2 }}
            />
          </FormControl>
          
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setActionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitAction}
              color={
                actionType === 'approve' ? 'success' : 
                actionType === 'reject' ? 'danger' : 'primary'
              }
            >
              {actionType === 'approve' ? 'Approve' : 
               actionType === 'reject' ? 'Reject' : 'Submit Feedback'}
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </div>
  );
};

export default MentorPanel; 