import React, { useState, useEffect } from 'react'; // Added useState to import
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useTheme, Box, Typography } from '@mui/material';
import HistoryEmpty from '../components/HistoryEmpty';
import HistoryLoading from '../components/HistoryLoading';
import HistoryTable from '../components/HistoryTable';
import HistoryPagination from '../components/HistoryPagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { useSidebar } from '../context/SidebarContext';

// Simple Error Boundary Component
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false); // useState is now defined

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
  console.log('History sidebar state:', isSidebarOpen); // Debug log
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/medibot/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log('History data received:', data);
        if (data.success) setHistory(data.history);
        else console.error('Failed to fetch history:', data);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

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
            {loading ? (
              <HistoryLoading />
            ) : history.length === 0 ? (
              <HistoryEmpty />
            ) : (
              <>
                <HistoryTable records={currentRecords} isDarkMode={isDarkMode} />
                <HistoryPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isDarkMode={isDarkMode}
                />
              </>
            )}
          </Box>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default History;