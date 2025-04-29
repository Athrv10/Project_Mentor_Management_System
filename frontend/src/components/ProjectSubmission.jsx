import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectSubmission = ({ studentId, mentorId, onSubmissionSuccess }) => {
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!projectData.title || !projectData.description) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/projects', {
        title: projectData.title,
        description: projectData.description,
        student_id: studentId,
        mentor_id: mentorId,
      });

      setLoading(false);
      
      if (onSubmissionSuccess) {
        onSubmissionSuccess(response.data);
      }
      
      // Clear form after successful submission
      setProjectData({ title: '', description: '' });
      
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit project proposal');
      console.error('Error submitting project:', err);
    }
  };

  const formContainerStyle = {
    backgroundColor: '#222',
    borderRadius: '6px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  };

  const titleStyle = {
    color: '#e50914',
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: 'bold',
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '12px 15px',
    marginBottom: '15px',
    fontSize: '14px',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '150px',
    resize: 'vertical',
  };

  const buttonStyle = {
    backgroundColor: '#e50914',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  };

  const errorStyle = {
    color: '#e50914',
    marginBottom: '15px',
    fontSize: '14px',
  };

  return (
    <div style={formContainerStyle}>
      <h3 style={titleStyle}>Submit Project Proposal</h3>
      
      {error && <div style={errorStyle}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Project Title"
          value={projectData.title}
          onChange={handleChange}
          style={inputStyle}
        />
        
        <textarea
          name="description"
          placeholder="Project Description (technologies, goals, timeline, etc.)"
          value={projectData.description}
          onChange={handleChange}
          style={textareaStyle}
        />
        
        <button 
          type="submit" 
          style={buttonStyle}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </form>
    </div>
  );
};

export default ProjectSubmission; 