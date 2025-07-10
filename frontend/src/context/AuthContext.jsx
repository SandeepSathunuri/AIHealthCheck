import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const logoutTimer = useRef(null);

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    setIsAuthenticated(false);
    setUser(null);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    navigate('/login');
  };

  const setLogoutTimer = (token) => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);

    try {
      const decoded = jwtDecode(token);
      const exp = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeout = exp - currentTime;

      if (timeout > 0) {
        logoutTimer.current = setTimeout(() => {
          alert('Session expired. Please log in again.');
          clearSession();
        }, timeout);
      } else {
        clearSession();
      }
    } catch (err) {
      console.error('Failed to decode JWT:', err);
      clearSession();
    }
  };

  const login = (token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('loggedInUser', username);
    setIsAuthenticated(true);
    setUser(username);
    setLogoutTimer(token);
    navigate('/home');
  };

  const logout = () => {
    clearSession();
  };

  // Handle refresh and initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('loggedInUser');

    if (token && username) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now();
        if (decoded.exp * 1000 > currentTime) {
          setIsAuthenticated(true);
          setUser(username);
          setLogoutTimer(token);
        } else {
          clearSession();
        }
      } catch (err) {
        console.error('Invalid token on refresh:', err);
        clearSession();
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []); // Empty dependency array for one-time check on mount

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);