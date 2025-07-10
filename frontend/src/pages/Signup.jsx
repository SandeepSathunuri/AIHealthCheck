import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ text: '', type: 'success', show: false });
  const navigate = useNavigate();
  const { isDarkMode } = useThemeMode();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    const copySignupInfo = { ...signupInfo };
    copySignupInfo[name] = value;
    setSignupInfo(copySignupInfo);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      setMessage({ text: 'name, email and password are required', type: 'error', show: true });
      setTimeout(() => setMessage({ ...message, show: false }), 3000);
      return;
    }
    try {
      const url = `http://localhost:8080/auth/signup`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupInfo)
      });
      const result = await response.json();
      const { success, message: msg, error } = result;
      if (success) {
        setMessage({ text: msg, type: 'success', show: true });
        setTimeout(() => {
          setMessage({ ...message, show: false });
          navigate('/login');
        }, 1000);
      } else if (error) {
        const details = error?.details[0].message;
        setMessage({ text: details, type: 'error', show: true });
        setTimeout(() => setMessage({ ...message, show: false }), 3000);
      } else if (!success) {
        setMessage({ text: msg, type: 'error', show: true });
        setTimeout(() => setMessage({ ...message, show: false }), 3000);
      }
      console.log(result);
    } catch (err) {
      setMessage({ text: 'Signup failed. Please try again later.', type: 'error', show: true });
      setTimeout(() => setMessage({ ...message, show: false }), 3000);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: isDarkMode ? '#1a1a2e' : '#f0f4ff',
        color: isDarkMode ? '#e0e0e0' : '#333',
        transition: 'all 0.3s ease',
      }}
    >
      <div className='container' style={{ backgroundColor: isDarkMode ? '#2e2e48' : '#FFF', borderRadius: '10px', padding: '32px 48px', boxShadow: isDarkMode ? '8px 8px 24px 0px rgba(0, 0, 0, 0.5)' : '8px 8px 24px 0px rgba(66, 68, 90, 1)' }}>
        <h1 style={{ color: isDarkMode ? '#e0e0e0' : '#333', marginBottom: '20px' }}>Signup</h1>
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label htmlFor='name' style={{ color: isDarkMode ? '#e0e0e0' : '#333', fontSize: '20px' }}>Name</label>
            <input
              onChange={handleChange}
              type='text'
              name='name'
              autoFocus
              placeholder='Enter your name...'
              value={signupInfo.name}
              style={{
                width: '100%',
                fontSize: '20px',
                padding: '10px',
                border: 'none',
                outline: 'none',
                borderBottom: `1px solid ${isDarkMode ? '#666' : 'black'}`,
                backgroundColor: isDarkMode ? '#333' : 'transparent',
                color: isDarkMode ? '#e0e0e0' : '#333',
              }}
            />
          </div>
          <div>
            <label htmlFor='email' style={{ color: isDarkMode ? '#e0e0e0' : '#333', fontSize: '20px' }}>Email</label>
            <input
              onChange={handleChange}
              type='email'
              name='email'
              placeholder='Enter your email...'
              value={signupInfo.email}
              style={{
                width: '100%',
                fontSize: '20px',
                padding: '10px',
                border: 'none',
                outline: 'none',
                borderBottom: `1px solid ${isDarkMode ? '#666' : 'black'}`,
                backgroundColor: isDarkMode ? '#333' : 'transparent',
                color: isDarkMode ? '#e0e0e0' : '#333',
              }}
            />
          </div>
          <div>
            <label htmlFor='password' style={{ color: isDarkMode ? '#e0e0e0' : '#333', fontSize: '20px' }}>Password</label>
            <input
              onChange={handleChange}
              type='password'
              name='password'
              placeholder='Enter your password...'
              value={signupInfo.password}
              style={{
                width: '100%',
                fontSize: '20px',
                padding: '10px',
                border: 'none',
                outline: 'none',
                borderBottom: `1px solid ${isDarkMode ? '#666' : 'black'}`,
                backgroundColor: isDarkMode ? '#333' : 'transparent',
                color: isDarkMode ? '#e0e0e0' : '#333',
              }}
            />
          </div>
          <button
            type='submit'
            style={{
              backgroundColor: 'purple',
              border: 'none',
              fontSize: '20px',
              color: 'white',
              borderRadius: '5px',
              padding: '10px',
              cursor: 'pointer',
              margin: '10px 0',
            }}
          >
            Signup
          </button>
          <span style={{ color: isDarkMode ? '#e0e0e0' : '#333' }}>
            Already have an account? <Link to="/login" style={{ color: isDarkMode ? '#e0e0e0' : '#333', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
          </span>
        </form>
        {message.show && (
          <Box
            sx={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              p: 1.5,
              borderRadius: 8,
              backgroundColor: message.type === 'success' ? '#4caf50' : '#f44336',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              animation: 'fadeInOut 3s ease forwards',
              zIndex: 1000,
            }}
          >
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {message.type === 'success' ? '✔' : '⚠'} {message.text}
            </Typography>
          </Box>
        )}
      </div>
    </div>
  );
}

export default Signup;