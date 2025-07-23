import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Avatar,
  IconButton,
  Chip,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  InputAdornment,
  Badge,
  LinearProgress,
} from "@mui/material";
import {
  Person,
  Edit,
  Settings,
  Notifications,
  Menu,
  Email,
  CalendarToday,
  TrendingUp,
  MedicalServices,
  History as HistoryIcon,
  AutoAwesome,
  Security,
  Speed,
  Verified,
  Star,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@mui/material/styles";
import { premiumTheme, premiumLightTheme, premiumGradients, premiumAnimations } from "../styles/premiumTheme";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import ModernSidebar from "../components/ui/ModernSidebar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import { API_ENDPOINTS } from "../config/api";

// Modern Header Component
const ModernHeader = ({ onToggleSidebar, isDarkMode }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          background: isDarkMode
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: isDarkMode
            ? "1px solid rgba(255, 255, 255, 0.12)"
            : "1px solid rgba(0, 0, 0, 0.12)",
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={onToggleSidebar}
              sx={{ color: isDarkMode ? "white" : "black" }}
            >
              <Menu />
            </IconButton>
            <Person sx={{ color: "#00d4ff", fontSize: 28 }} />
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: isDarkMode ? "white" : "black" }}
            >
              User Profile
            </Typography>
            <Chip
              label="Account"
              size="small"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                fontWeight: 600,
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton sx={{ color: isDarkMode ? "white" : "black" }}>
              <Notifications />
            </IconButton>
            <IconButton sx={{ color: isDarkMode ? "white" : "black" }}>
              <Settings />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

// Premium Stats Card with FAANG-level design
const PremiumStatsCard = ({ icon, title, value, gradient, isDarkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    whileHover={{ y: -4 }}
  >
    <PremiumCard variant="glass" hover glow={false}>
      <Box sx={{ p: 4, textAlign: "center", position: 'relative' }}>
        {/* Floating icon with premium styling */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "20px",
              background: gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              boxShadow: `0 8px 32px ${gradient.includes('4facfe') ? 'rgba(79, 172, 254, 0.4)' : 
                                      gradient.includes('43e97b') ? 'rgba(67, 233, 123, 0.4)' : 
                                      'rgba(250, 112, 154, 0.4)'}`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                background: gradient,
                borderRadius: '22px',
                filter: 'blur(10px)',
                opacity: 0.3,
                zIndex: -1,
              }
            }}
          >
            {icon}
          </Box>
        </motion.div>

        {/* Animated counter */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Typography
            variant="h3"
            sx={{ 
              color: isDarkMode ? "white" : "black", 
              fontWeight: 800, 
              mb: 1,
              letterSpacing: '-0.02em',
              background: gradient,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {value}
          </Typography>
        </motion.div>

        <Typography
          variant="body1"
          sx={{
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(0, 0, 0, 0.8)",
            fontWeight: 500,
            letterSpacing: '0.01em'
          }}
        >
          {title}
        </Typography>

        {/* Subtle progress indicator */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={typeof value === 'string' ? 85 : Math.min(value * 10, 100)}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: gradient,
                borderRadius: 2,
              },
            }}
          />
        </Box>
      </Box>
    </PremiumCard>
  </motion.div>
);

const Profile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useThemeMode();
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
  });
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const isSmallScreen = useMediaQuery(premiumTheme.breakpoints.down("md"));

  // Use dynamic user data from AuthContext with fallback
  const currentUser = user || {
    name: "Medical User",
    email: "user@medical.ai",
    joinDate: "2024-01-15",
    avatar: null,
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleTheme = () => {
    toggleDarkMode();
  };

  // Initialize edit form data when user data changes
  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleEditProfile = () => {
    setEditDialogOpen(true);
    setEditError("");
    setEditSuccess(false);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditError("");
    setEditSuccess(false);
    // Reset form data to original values
    if (user) {
      setEditFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  };

  const handleEditFormChange = (field) => (event) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (editError) setEditError("");
  };

  const handleSaveProfile = async () => {
    setEditLoading(true);
    setEditError("");

    // Basic validation
    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      setEditError("Name and email are required");
      setEditLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      setEditError("Please enter a valid email address");
      setEditLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Call backend API to update profile
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update user data in AuthContext
        updateUser(editFormData);
        setEditSuccess(true);
        
        // Close dialog after a short delay
        setTimeout(() => {
          handleCloseEditDialog();
        }, 1500);
      } else {
        setEditError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setEditError("Network error. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(API_ENDPOINTS.HISTORY, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setHistoryCount(data.history.length);
        }
      } catch (err) {
        console.error("Error fetching user stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [navigate]);

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ThemeProvider theme={isDarkMode ? premiumTheme : premiumLightTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: isDarkMode
            ? "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
            : "linear-gradient(135deg, #fafbfc 0%, #f1f5f9 50%, #e2e8f0 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%)",
            zIndex: 0,
          }}
        />

        {/* Modern Sidebar */}
        <ModernSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          user={user}
        />

        {/* Header */}
        <ModernHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isDarkMode={isDarkMode}
        />

        {/* Main Content */}
        <Container
          maxWidth="xl"
          sx={{ py: 4, position: "relative", zIndex: 1 }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <LoadingSpinner message="Loading profile..." />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {/* Profile Card */}
              <Grid item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <PremiumCard variant="glass" glow>
                    <Box sx={{ p: 5, textAlign: "center", position: 'relative' }}>
                      {/* Premium Avatar with glow effect */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: premiumGradients.success,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid rgba(15, 15, 35, 1)',
                              }}
                            >
                              <Verified sx={{ color: 'white', fontSize: 18 }} />
                            </Box>
                          }
                        >
                          <Avatar
                            sx={{
                              width: 140,
                              height: 140,
                              mx: "auto",
                              mb: 3,
                              background: premiumGradients.primary,
                              fontSize: "3.5rem",
                              border: '4px solid rgba(255, 255, 255, 0.1)',
                              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                              position: 'relative',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -6,
                                left: -6,
                                right: -6,
                                bottom: -6,
                                background: premiumGradients.primary,
                                borderRadius: '50%',
                                filter: 'blur(20px)',
                                opacity: 0.3,
                                zIndex: -1,
                              }
                            }}
                          >
                            <Person sx={{ fontSize: "3.5rem" }} />
                          </Avatar>
                        </Badge>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            color: isDarkMode ? "white" : "black",
                            fontWeight: 800,
                            mb: 1,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {user.name}
                        </Typography>

                        <Typography
                          variant="h6"
                          sx={{
                            color: isDarkMode
                              ? "rgba(255, 255, 255, 0.8)"
                              : "rgba(0, 0, 0, 0.8)",
                            mb: 3,
                            fontWeight: 400,
                          }}
                        >
                          {user.email}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
                          <Chip
                            icon={<CalendarToday />}
                            label={`Joined ${formatJoinDate(user.joinDate)}`}
                            sx={{
                              background: premiumGradients.success,
                              color: "white",
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                          <Chip
                            icon={<Star />}
                            label="Pro Member"
                            sx={{
                              background: premiumGradients.warning,
                              color: "white",
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            justifyContent: "center",
                            flexWrap: 'wrap'
                          }}
                        >
                          <PremiumButton
                            icon={<Edit />}
                            variant="gradient"
                            onClick={handleEditProfile}
                            gradient={premiumGradients.primary}
                            glow
                          >
                            Edit Profile
                          </PremiumButton>
                          <PremiumButton
                            icon={<Settings />}
                            variant="glass"
                            onClick={() => console.log("Settings")}
                          >
                            Settings
                          </PremiumButton>
                        </Box>
                      </motion.div>
                    </Box>
                  </PremiumCard>
                </motion.div>
              </Grid>

              {/* Stats Cards */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <PremiumStatsCard
                      icon={
                        <MedicalServices
                          sx={{ color: "white", fontSize: 28 }}
                        />
                      }
                      title="Medical Analyses"
                      value={historyCount}
                      gradient={premiumGradients.success}
                      isDarkMode={isDarkMode}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <PremiumStatsCard
                      icon={
                        <HistoryIcon sx={{ color: "white", fontSize: 28 }} />
                      }
                      title="Total Sessions"
                      value={historyCount}
                      gradient={premiumGradients.warning}
                      isDarkMode={isDarkMode}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <PremiumStatsCard
                      icon={
                        <TrendingUp sx={{ color: "white", fontSize: 28 }} />
                      }
                      title="Health Score"
                      value="85%"
                      gradient={premiumGradients.error}
                      isDarkMode={isDarkMode}
                    />
                  </Grid>
                </Grid>

                {/* Account Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{ marginTop: 24 }}
                >
                  <PremiumCard variant="glass">
                    <Box sx={{ p: 4 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          color: isDarkMode ? "white" : "black",
                          fontWeight: 700,
                          mb: 3,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Account Information
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Email sx={{ color: "#00d4ff" }} />
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isDarkMode
                                    ? "rgba(255, 255, 255, 0.7)"
                                    : "rgba(0, 0, 0, 0.7)",
                                }}
                              >
                                Email Address
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ color: isDarkMode ? "white" : "black" }}
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <CalendarToday sx={{ color: "#43e97b" }} />
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isDarkMode
                                    ? "rgba(255, 255, 255, 0.7)"
                                    : "rgba(0, 0, 0, 0.7)",
                                }}
                              >
                                Member Since
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ color: isDarkMode ? "white" : "black" }}
                              >
                                {formatJoinDate(user.joinDate)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>

                      <Divider
                        sx={{
                          my: 3,
                          borderColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.12)"
                            : "rgba(0, 0, 0, 0.12)",
                        }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          justifyContent: "flex-end",
                        }}
                      >
                        <PremiumButton
                          variant="glass"
                          onClick={() => navigate("/home")}
                        >
                          Back to Home
                        </PremiumButton>
                        <PremiumButton
                          variant="outline"
                          onClick={handleLogout}
                        >
                          Logout
                        </PremiumButton>
                      </Box>
                    </Box>
                  </PremiumCard>
                </motion.div>
              </Grid>
            </Grid>
          )}
        </Container>

        {/* Edit Profile Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: isDarkMode
                ? "rgba(30, 30, 48, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: isDarkMode
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <DialogTitle
            sx={{
              color: isDarkMode ? "white" : "black",
              borderBottom: isDarkMode
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Edit sx={{ color: "#667eea" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Edit Profile
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <AnimatePresence>
              {editError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {editError}
                  </Alert>
                </motion.div>
              )}

              {editSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Profile updated successfully!
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={editFormData.name}
                onChange={handleEditFormChange("name")}
                disabled={editLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDarkMode ? "white" : "black",
                    "& fieldset": {
                      borderColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.3)"
                        : "rgba(0, 0, 0, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#667eea",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#667eea",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.7)",
                    "&.Mui-focused": {
                      color: "#667eea",
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={editFormData.email}
                onChange={handleEditFormChange("email")}
                disabled={editLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDarkMode ? "white" : "black",
                    "& fieldset": {
                      borderColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.3)"
                        : "rgba(0, 0, 0, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#667eea",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#667eea",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.7)",
                    "&.Mui-focused": {
                      color: "#667eea",
                    },
                  },
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseEditDialog}
              disabled={editLoading}
              sx={{
                color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
              }}
            >
              Cancel
            </Button>
            <PremiumButton
              onClick={handleSaveProfile}
              loading={editLoading}
              success={editSuccess}
              gradient={premiumGradients.primary}
              disabled={editLoading}
              glow
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </PremiumButton>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Profile;
