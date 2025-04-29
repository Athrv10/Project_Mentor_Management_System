import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [userType, setUserType] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setError('');
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      let endpoint = '';
      
      switch (userType) {
        case 'admin':
          endpoint = 'http://127.0.0.1:5000/admin/login';
          break;
        case 'mentor':
          endpoint = 'http://127.0.0.1:5000/faculty/login';
          break;
        case 'student':
          endpoint = 'http://127.0.0.1:5000/student/login';
          break;
        default:
          setError('Please select a user type');
          return;
      }
      
      const response = await axios.post(endpoint, credentials);
      
      // Store user info and token in localStorage for session management
      localStorage.setItem('userType', userType);
      localStorage.setItem('userData', JSON.stringify(response.data));
      
      // Redirect based on user type
      if (userType === 'admin') {
        navigate('/admin');
      } else if (userType === 'mentor') {
        navigate('/faculty');
      } else {
        navigate('/student');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#141414',
    color: '#fff',
    padding: '20px'
  };

  const cardStyle = {
    backgroundColor: '#222',
    borderRadius: '8px',
    padding: '30px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
  };

  const titleStyle = {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '28px',
    color: '#e50914'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const userTypeContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '25px'
  };

  const buttonStyle = {
    padding: '12px 20px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#333',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e50914'
  };

  const inputStyle = {
    padding: '12px 15px',
    borderRadius: '4px',
    border: '1px solid #444',
    backgroundColor: '#333',
    color: '#fff',
    width: '100%'
  };

  const loginButtonStyle = {
    padding: '12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#e50914',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px'
  };

  const errorStyle = {
    color: '#e50914',
    textAlign: 'center',
    marginTop: '15px'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Mentor Project Portal</h1>
        
        <div style={userTypeContainerStyle}>
          <button 
            style={userType === 'admin' ? activeButtonStyle : buttonStyle}
            onClick={() => handleUserTypeSelect('admin')}
          >
            Admin
          </button>
          <button 
            style={userType === 'mentor' ? activeButtonStyle : buttonStyle}
            onClick={() => handleUserTypeSelect('mentor')}
          >
            Mentor
          </button>
          <button 
            style={userType === 'student' ? activeButtonStyle : buttonStyle}
            onClick={() => handleUserTypeSelect('student')}
          >
            Student
          </button>
        </div>
        
        {userType && (
          <form style={formStyle} onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              style={inputStyle}
              value={credentials.username}
              onChange={handleInputChange}
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              style={inputStyle}
              value={credentials.password}
              onChange={handleInputChange}
            />
            
            <button type="submit" style={loginButtonStyle}>
              Login as {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </button>
          </form>
        )}
        
        {error && <div style={errorStyle}>{error}</div>}
      </div>
    </div>
  );
};

export default Login; 