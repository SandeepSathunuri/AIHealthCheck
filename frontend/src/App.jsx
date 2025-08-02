import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import Home from './pages/Home';
import History from './pages/History';
import Profile from './pages/Profile';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  const PrivateRoute = ({ children }) => {
    console.log('🔒 PrivateRoute check:', { loading, isAuthenticated });
    
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          background: 'linear-gradient(135deg, #0a0a1e 0%, #1a1a3a 50%, #2d1b69 100%)'
        }}>
          Loading...
        </div>
      );
    }
    
    if (!isAuthenticated) {
      console.log('🔒 Not authenticated, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    console.log('🔒 Authenticated, rendering protected content');
    return children;
  };

  const PageTransition = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  );

  return (
    <>
      <CssBaseline />
      <div className="App" style={{ minHeight: '100vh', overflow: 'auto' }}>
        <SidebarProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <Home />
                    </PageTransition>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PageTransition>
                    <Login />
                  </PageTransition>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PageTransition>
                    <Signup />
                  </PageTransition>
                } 
              />
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <Home />
                    </PageTransition>
                  </PrivateRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <History />
                    </PageTransition>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <Profile />
                    </PageTransition>
                  </PrivateRoute>
                }
              />
            </Routes>
          </AnimatePresence>
        </SidebarProvider>
      </div>
    </>
  );
}

export default App;