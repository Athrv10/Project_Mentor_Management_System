import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Alert from '@mui/joy/Alert';
import CircularProgress from '@mui/joy/CircularProgress';
import Box from '@mui/joy/Box';
import Grid from '@mui/joy/Grid';
import Slider from '@mui/joy/Slider';
import MessageChat from './MessageChat';

const ProjectDetails = ({ projectId, userType, onUpdateSuccess }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState('');
  
  useEffect(() => {
    fetchProjectDetails();
    
    // Get user ID from localStorage based on user type
    if (userType === 'student') {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      setUserId(userData.student_id);
    } else if (userType === 'mentor') {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      setUserId(userData.mentor_id || userData.id);
    }
  }, [projectId]);
  
  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/projects/${projectId}`);
      setProject(response.data);
      
      // Store the internal numeric id for use with message chat
      const internalProjectId = response.data.id;
      
      // Initialize form fields
      setTitle(response.data.title);
      setDescription(response.data.description || '');
      setGithubLink(response.data.github_link || '');
      setStatus(response.data.status || 'pending');
      setProgress(response.data.progress_percentage || 0);
      setFeedback(response.data.mentor_feedback || '');
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError('Failed to load project details. Please try again.');
      setLoading(false);
    }
  };
  
  const handleSaveChanges = async () => {
    try {
      const updateData = {
        title,
        description,
        github_link: githubLink,
        progress_percentage: progress
      };
      
      // Add fields that only mentors can update
      if (userType === 'mentor') {
        updateData.status = status;
        updateData.mentor_feedback = feedback;
      }
      
      await axios.put(`http://127.0.0.1:5000/projects/${projectId}`, updateData);
      
      setSuccessMessage('Project updated successfully!');
      setEditMode(false);
      fetchProjectDetails();
      
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!project) {
    return <Typography>Project not found.</Typography>;
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'in progress':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'neutral';
    }
  };
  
  return (
    <Box sx={{ color: 'white', p: 2 }}>
      {successMessage && (
        <Alert className="fade-in" color="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert className="fade-in" color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h4" sx={{ color: '#e50914' }}>
          {editMode ? 'Edit Project' : 'Project Details'}
        </Typography>
        
        {!editMode && (userType === 'student' || userType === 'mentor') && (
          <div className="button-scale">
            <Button 
              onClick={() => setEditMode(true)}
              sx={{ 
                bgcolor: '#333',
                color: 'white',
                '&:hover': { bgcolor: '#444' }
              }}
            >
              Edit
            </Button>
          </div>
        )}
      </Box>
      
      {editMode && userType === 'student' && (
        <Alert 
          color="neutral" 
          variant="soft" 
          sx={{ mb: 3, borderLeft: '4px solid #e50914' }}
        >
          Note: As a student, you can edit project title, description, GitHub link, and progress. 
          Only mentors can change project status or provide feedback.
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ color: '#aaa' }}>Project ID</FormLabel>
            <Typography sx={{ color: 'white' }}>{project.project_id}</Typography>
          </FormControl>
        </Grid>
        
        <Grid xs={12} md={6}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ color: '#aaa' }}>Status</FormLabel>
            {editMode && userType === 'mentor' ? (
              <Select
                value={status}
                onChange={(_, newValue) => setStatus(newValue)}
                sx={{ 
                  bgcolor: '#333',
                  color: 'white',
                  '&:focus': { borderColor: '#e50914' }
                }}
              >
                <Option value="Pending">Pending</Option>
                <Option value="Approved">Approved</Option>
                <Option value="Rejected">Rejected</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="Completed">Completed</Option>
              </Select>
            ) : (
              <Typography sx={{ 
                color: 'white',
                bgcolor: getStatusColor(project.status),
                py: 0.5,
                px: 1,
                borderRadius: 1,
                display: 'inline-block'
              }}>
                {project.status}
                {editMode && userType === 'student' && (
                  <Typography level="body-xs" sx={{ display: 'block', mt: 1, color: '#aaa' }}>
                    (Only mentors can change status)
                  </Typography>
                )}
              </Typography>
            )}
          </FormControl>
        </Grid>
        
        <Grid xs={12} md={6}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ color: '#aaa' }}>Project Title</FormLabel>
            {editMode ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ 
                  bgcolor: '#333',
                  color: 'white',
                  '&:focus': { borderColor: '#e50914' }
                }}
              />
            ) : (
              <Typography sx={{ color: 'white' }}>{project.title}</Typography>
            )}
          </FormControl>
        </Grid>
        
        <Grid xs={12} md={6}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ color: '#aaa' }}>Student</FormLabel>
            <Typography sx={{ color: 'white' }}>{project.student_name}</Typography>
          </FormControl>
        </Grid>
        
        <Grid xs={12}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ color: '#aaa' }}>GitHub Link</FormLabel>
            {editMode ? (
              <Input
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/username/repo"
                sx={{ 
                  bgcolor: '#333',
                  color: 'white',
                  '&:focus': { borderColor: '#e50914' }
                }}
              />
            ) : (
              <Typography sx={{ color: 'white' }}>
                {project.github_link ? (
                  <a 
                    href={project.github_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#e50914' }}
                  >
                    {project.github_link}
                  </a>
                ) : (
                  'Not provided'
                )}
              </Typography>
            )}
          </FormControl>
        </Grid>
        
        <Grid xs={12}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ color: '#aaa' }}>Description</FormLabel>
            {editMode ? (
              <Textarea
                minRows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ 
                  bgcolor: '#333',
                  color: 'white',
                  '&:focus': { borderColor: '#e50914' }
                }}
              />
            ) : (
              <Typography sx={{ color: 'white' }}>{project.description || 'No description provided.'}</Typography>
            )}
          </FormControl>
        </Grid>
        
        <Grid xs={12}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ color: '#aaa' }}>Progress ({progress}%)</FormLabel>
            {editMode ? (
              <Slider
                value={progress}
                onChange={(_, newValue) => setProgress(newValue)}
                min={0}
                max={100}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' }
                ]}
                sx={{ 
                  color: '#e50914',
                  '& .MuiSlider-thumb': { backgroundColor: '#e50914' },
                  '& .MuiSlider-track': { backgroundColor: '#e50914' },
                  '& .MuiSlider-rail': { backgroundColor: '#666' }
                }}
              />
            ) : (
              <Box sx={{ 
                width: '100%', 
                height: 10, 
                bgcolor: '#333',
                borderRadius: 5,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Box sx={{ 
                  width: `${project.progress_percentage}%`, 
                  height: '100%', 
                  bgcolor: '#e50914',
                  borderRadius: 5,
                  transition: 'width 0.5s ease-in-out'
                }} />
              </Box>
            )}
          </FormControl>
        </Grid>
        
        <Grid xs={12}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ color: '#aaa' }}>
              Mentor Feedback
              {editMode && userType === 'student' && (
                <Typography level="body-xs" component="span" sx={{ ml: 1, color: '#aaa' }}>
                  (read-only)
                </Typography>
              )}
            </FormLabel>
            {editMode && userType === 'mentor' ? (
              <Textarea
                minRows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                sx={{ 
                  bgcolor: '#333',
                  color: 'white',
                  '&:focus': { borderColor: '#e50914' }
                }}
              />
            ) : (
              <Box sx={{ 
                p: 2, 
                bgcolor: project.mentor_feedback ? 'rgba(229, 9, 20, 0.1)' : 'transparent', 
                borderLeft: project.mentor_feedback ? '4px solid #e50914' : 'none',
                borderRadius: '4px',
                mt: 1
              }}>
                {project.mentor_feedback ? (
                  <>
                    <Typography sx={{ 
                      color: 'white', 
                      whiteSpace: 'pre-wrap',
                      fontStyle: project.mentor_feedback ? 'normal' : 'italic' 
                    }}>
                      {project.mentor_feedback}
                    </Typography>
                    <Typography level="body-xs" sx={{ mt: 1, color: '#aaa' }}>
                      Last updated: {new Date(project.last_updated || project.submission_date).toLocaleString()}
                    </Typography>
                  </>
                ) : (
                  <Typography sx={{ color: '#aaa', fontStyle: 'italic' }}>
                    No feedback provided yet.
                  </Typography>
                )}
              </Box>
            )}
          </FormControl>
        </Grid>
      </Grid>
      
      {editMode && (
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <div className="button-scale">
            <Button 
              onClick={handleSaveChanges}
              sx={{ 
                bgcolor: '#e50914',
                color: 'white',
                '&:hover': { bgcolor: '#b2070e' }
              }}
            >
              Save Changes
            </Button>
          </div>
          
          <div className="button-scale">
            <Button 
              onClick={() => setEditMode(false)}
              variant="outlined" 
              sx={{ 
                color: 'white',
                borderColor: '#666',
                '&:hover': { borderColor: 'white', bgcolor: 'transparent' }
              }}
            >
              Cancel
            </Button>
          </div>
        </Box>
      )}
      
      {/* Only show the message chat if not in edit mode and user ID is set */}
      {!editMode && userId && project && (
        <MessageChat 
          projectId={project.id} 
          userId={userId} 
          userType={userType}
        />
      )}
    </Box>
  );
};

export default ProjectDetails; 