import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';
import { Box, Typography } from '@mui/material';

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ text: '', type: 'success', show: false });
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      setMessage({ text: 'Email and password are required', type: 'error', show: true });
      return;
    }

    try {
      const url = `http://localhost:8080/auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo),
      });

      const result = await response.json();
      const { success, message: msg, jwtToken, name, error } = result;

      if (success) {
        setMessage({ text: msg, type: 'success', show: true });
        setTimeout(() => setMessage({ ...message, show: false }), 3000); // Hide after 3s
        login(jwtToken, name);
      } else if (error) {
        const details = error?.details?.[0]?.message || 'Login failed';
        setMessage({ text: details, type: 'error', show: true });
        setTimeout(() => setMessage({ ...message, show: false }), 3000);
      } else {
        setMessage({ text: msg, type: 'error', show: true });
        setTimeout(() => setMessage({ ...message, show: false }), 3000);
      }
    } catch (err) {
      setMessage({ text: 'Login failed. Please try again later.', type: 'error', show: true });
      setTimeout(() => setMessage({ ...message, show: false }), 3000);
      console.error(err);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f4ff',
        color: '#333',
        transition: 'all 0.3s ease',
      }}
    >
      <div className='container' style={{ backgroundColor: '#FFF', borderRadius: '10px', padding: '32px 48px', boxShadow: '8px 8px 24px 0px rgba(66, 68, 90, 1)' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>Login</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label htmlFor='email' style={{ color: '#333', fontSize: '20px' }}>Email</label>
            <input
              onChange={handleChange}
              type='email'
              name='email'
              placeholder='Enter your email...'
              value={loginInfo.email}
              style={{
                width: '100%',
                fontSize: '20px',
                padding: '10px',
                border: 'none',
                outline: 'none',
                borderBottom: '1px solid black',
                backgroundColor: 'transparent',
                color: '#333',
              }}
            />
          </div>
          <div>
            <label htmlFor='password' style={{ color: '#333', fontSize: '20px' }}>Password</label>
            <input
              onChange={handleChange}
              type='password'
              name='password'
              placeholder='Enter your password...'
              value={loginInfo.password}
              style={{
                width: '100%',
                fontSize: '20px',
                padding: '10px',
                border: 'none',
                outline: 'none',
                borderBottom: '1px solid black',
                backgroundColor: 'transparent',
                color: '#333',
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
            Login
          </button>
          <span style={{ color: '#333' }}>
            Don’t have an account? <Link to="/signup" style={{ color: '#333', textDecoration: 'none', fontWeight: 'bold' }}>Signup</Link>
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

export default Login;