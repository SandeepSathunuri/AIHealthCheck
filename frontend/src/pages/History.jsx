import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useTheme, Box, Typography, Alert } from '@mui/material';
import HistoryEmpty from '../components/HistoryEmpty';
import HistoryLoading from '../components/HistoryLoading';
import HistoryTable from '../components/HistoryTable';
import HistoryPagination from '../components/HistoryPagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { useSidebar } from '../context/SidebarContext';
import { useNavigate } from 'react-router-dom'; // Added for navigation

// Simple Error Boundary Component
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <Typography color="error">Something went wrong. Please try again later.</Typography>;
  }

  return children;
};

const History = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  console.log('History sidebar state:', isSidebarOpen);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate(); // Added for navigation

  const dynamicTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: { main: isDarkMode ? '#00d4ff' : '#1e3a8a' },
      background: { default: isDarkMode ? '#0a0a1e' : '#e6f0fa' },
      text: { primary: isDarkMode ? '#ffffff' : '#1e3a8a', secondary: isDarkMode ? '#d1d5db' : '#4b5563' },
    },
  });

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    console.log('Toggling dark mode to:', newDarkMode);
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Read operation
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          return;
        }
        const res = await fetch('http://localhost:8080/medibot/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log('History data received:', data);
        if (data.success) setHistory(data.history);
        else {
          console.error('Failed to fetch history:', data);
          setError(data.message || 'Failed to fetch history');
        }
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Unable to connect to the server. Please ensure the backend is running at http://localhost:8080.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Delete operation
  const handleDelete = async (id) => {
    setError(null);
    setSuccess(null);
    console.log(`Deleting record with ID: ${id}, URL: http://localhost:8080/medibot/history/${id}`);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/medibot/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setSuccess('Record deleted successfully');
        setHistory(history.filter((record) => record.id !== id));
      } else {
        setError(data.message || 'Failed to delete record');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Error deleting record or backend not available');
    }
  };

  // Edit operation
  const handleEdit = (record) => {
    console.log('Edit clicked for record:', record);
    navigate('/home', { state: { editRecord: record } }); // Navigate to HomePage with record data
  };

  useEffect(() => {
    const handleProcessResponse = (event) => {
      if (event.data && event.data.autoplay_url) {
        const audio = new Audio(event.data.autoplay_url);
        audio.play().catch((err) => console.error('Auto-play failed:', err));
      }
    };
    window.addEventListener('message', handleProcessResponse);
    return () => window.removeEventListener('message', handleProcessResponse);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = history.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(history.length / recordsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <ThemeProvider theme={dynamicTheme}>
      <ErrorBoundary>
        <Box
          sx={{
            minHeight: '100vh',
            width: '100%',
            overflowX: 'hidden',
            overflowY: 'auto',
            background: dynamicTheme.palette.background.default,
            display: 'flex',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 15% 15%, rgba(0, 212, 255, 0.2), transparent 60%)',
              zIndex: 0,
            },
          }}
        >
          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            handleLogout={handleLogout}
          />
          <Box
            flexGrow={1}
            p={2}
            sx={{ ml: isSidebarOpen ? '70px' : '50px', transition: 'margin-left 0.3s ease' }}
          >
            <Typography
              variant="h4"
              mb={3}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, color: dynamicTheme.palette.text.primary }}
            >
              <FontAwesomeIcon icon={faHistory} />
              Diagnosis History
            </Typography>

            {/* History Table and Pagination */}
            {loading ? (
              <HistoryLoading />
            ) : history.length === 0 ? (
              <HistoryEmpty />
            ) : (
              <>
                <HistoryTable
                  records={currentRecords}
                  isDarkMode={isDarkMode}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                <HistoryPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isDarkMode={isDarkMode}
                />
              </>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          </Box>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default History;