import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Avatar,
  IconButton,
  Chip,
  Divider,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  InputAdornment,
  Paper,
  Stack,
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
  Security,
  Verified,
  Star,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { professionalTheme, professionalDarkTheme } from "../styles/professionalTheme";
import ProfessionalCard from "../components/ui/ProfessionalCard";
import ProfessionalButton from "../components/ui/ProfessionalButton";
import ModernSidebar from "../components/ui/ModernSidebar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import { API_ENDPOINTS } from "../config/api";

// Professional Header Component
const ProfessionalHeader = ({ onToggleSidebar, isDarkMode }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        bgcolor: "background.paper",
        borderRadius: 0,
        borderBottom: 1,
        borderColor: "divider",
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
          <IconButton onClick={onToggleSidebar} color="primary">
            <Menu />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            <Person />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
              User Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your account settings and preferences
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="primary">
            <Notifications />
          </IconButton>
          <IconButton color="primary">
            <Settings />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

// Professional Stats Card
const ProfessionalStatsCard = ({ icon, title, value, color = "primary" }) => (
  <ProfessionalCard
    title={title}
    icon={icon}
    sx={{ textAlign: "center", minHeight: 140 }}
  >
    <Typography
      variant="h3"
      sx={{ 
        fontWeight: 700, 
        mb: 1,
        color: `${color}.main`,
      }}
    >
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
  </ProfessionalCard>
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
    <ThemeProvider theme={isDarkMode ? professionalDarkTheme : professionalTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          position: "relative",
        }}
      >
        {/* Professional Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: isDarkMode
              ? "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)"
              : "radial-gradient(circle at 75% 25%, rgba(37, 99, 235, 0.03) 0%, transparent 50%)",
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
        <ProfessionalHeader
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
                <ProfessionalCard
                  title="Profile Information"
                  subtitle="Your account details"
                  icon={<Person />}
                  actions={
                    <ProfessionalButton
                      size="small"
                      onClick={handleEditProfile}
                      icon={<Edit />}
                      variant="outlined"
                    >
                      Edit
                    </ProfessionalButton>
                  }
                >
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        mx: "auto",
                        mb: 2,
                        bgcolor: "primary.main",
                        fontSize: "2.5rem",
                      }}
                    >
                      <Person sx={{ fontSize: "2.5rem" }} />
                    </Avatar>

                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {user.name}
                    </Typography>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {user.email}
                    </Typography>

                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                      <Chip
                        icon={<CalendarToday />}
                        label={`Joined ${formatJoinDate(user.joinDate)}`}
                        color="secondary"
                        size="small"
                      />
                      <Chip
                        icon={<Verified />}
                        label="Verified"
                        color="success"
                        size="small"
                      />
                    </Stack>
                  </Box>
                </ProfessionalCard>
              </Grid>

              {/* Stats Cards */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <ProfessionalStatsCard
                      icon={<MedicalServices />}
                      title="Medical Analyses"
                      value={historyCount}
                      color="primary"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <ProfessionalStatsCard
                      icon={<HistoryIcon />}
                      title="Total Sessions"
                      value={historyCount}
                      color="secondary"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <ProfessionalStatsCard
                      icon={<TrendingUp />}
                      title="Health Score"
                      value="85%"
                      color="success"
                    />
                  </Grid>
                </Grid>

                {/* Account Information */}
                <Box sx={{ mt: 3 }}>
                  <ProfessionalCard
                    title="Account Information"
                    subtitle="Your account details and settings"
                    icon={<Security />}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: "info.main",
                              color: "white",
                            }}
                          >
                            <Email />
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email Address
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: "success.main",
                              color: "white",
                            }}
                          >
                            <CalendarToday />
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Member Since
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formatJoinDate(user.joinDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <ProfessionalButton
                        variant="outlined"
                        onClick={() => navigate("/home")}
                      >
                        Back to Home
                      </ProfessionalButton>
                      <ProfessionalButton
                        variant="contained"
                        color="error"
                        onClick={handleLogout}
                      >
                        Logout
                      </ProfessionalButton>
                    </Stack>
                  </ProfessionalCard>
                </Box>
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
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Edit color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Edit Profile
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            {editError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {editError}
              </Alert>
            )}

            {editSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Profile updated successfully!
              </Alert>
            )}

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                value={editFormData.name}
                onChange={handleEditFormChange("name")}
                disabled={editLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
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
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <ProfessionalButton
              variant="outlined"
              onClick={handleCloseEditDialog}
              disabled={editLoading}
            >
              Cancel
            </ProfessionalButton>
            <ProfessionalButton
              variant="contained"
              onClick={handleSaveProfile}
              loading={editLoading}
            >
              Save Changes
            </ProfessionalButton>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Profile;