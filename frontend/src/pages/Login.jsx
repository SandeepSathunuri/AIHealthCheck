import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Card,
  CardContent,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  LocalHospital,
  Security,
  Verified,
  ArrowForward,
  Login as LoginIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@mui/material/styles";
import { premiumTheme, premiumLightTheme } from "../styles/premiumTheme";
import PremiumButton from "../components/ui/PremiumButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";

const ProfessionalLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode } = useThemeMode();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("🔐 Login form submitted with:", { email, password: "***" });

    try {
      const result = await login(email, password);
      console.log("🔐 Login result:", result);

      if (result.success) {
        console.log("✅ Login successful, navigating to home");
        navigate("/");
      } else {
        console.log("❌ Login failed:", result.message);
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const securityFeatures = [
    { icon: <Security />, text: "HIPAA Compliant" },
    { icon: <Verified />, text: "End-to-End Encryption" },
    { icon: <LocalHospital />, text: "Medical Grade Security" },
  ];

  return (
    <ThemeProvider theme={isDarkMode ? premiumTheme : premiumLightTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: isDarkMode
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: isDarkMode
              ? "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)"
              : "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)",
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              py: 4,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ width: "100%", maxWidth: "1000px" }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 0,
                  borderRadius: "24px",
                  overflow: "hidden",
                  background: isDarkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${
                    isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)"
                  }`,
                  boxShadow: isDarkMode
                    ? "0 25px 50px rgba(0, 0, 0, 0.3)"
                    : "0 25px 50px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Left Panel - Branding */}
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    p: 6,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Background Pattern */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage:
                        "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",
                      zIndex: 0,
                    }}
                  />

                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 80,
                          height: 80,
                          borderRadius: "20px",
                          background: "rgba(255, 255, 255, 0.2)",
                          mb: 3,
                          mx: "auto",
                        }}
                      >
                        <LocalHospital sx={{ fontSize: 40, color: "white" }} />
                      </Box>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          fontSize: { xs: "2rem", md: "2.5rem" },
                        }}
                      >
                        MediAI Pro
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          opacity: 0.9,
                          mb: 4,
                          fontWeight: 400,
                        }}
                      >
                        Advanced AI Medical Analysis Platform
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.8,
                          mb: 4,
                          lineHeight: 1.6,
                        }}
                      >
                        Secure, HIPAA-compliant medical AI platform trusted by
                        healthcare professionals worldwide.
                      </Typography>
                    </motion.div>

                    {/* Security Features */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <Stack spacing={2}>
                        {securityFeatures.map((feature, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              p: 2,
                              borderRadius: "12px",
                              background: "rgba(255, 255, 255, 0.1)",
                              backdropFilter: "blur(10px)",
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                background: "rgba(255, 255, 255, 0.2)",
                              }}
                            >
                              {React.cloneElement(feature.icon, {
                                sx: { fontSize: 18 },
                              })}
                            </Avatar>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {feature.text}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </motion.div>
                  </Box>
                </Box>

                {/* Right Panel - Login Form */}
                <Box sx={{ p: 6 }}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: isDarkMode ? "white" : "#1e293b",
                          mb: 1,
                        }}
                      >
                        Welcome Back
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: isDarkMode
                            ? "rgba(255,255,255,0.7)"
                            : "#64748b",
                        }}
                      >
                        Sign in to your medical AI account
                      </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                      <Stack spacing={3}>
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <Alert
                                severity="error"
                                sx={{ borderRadius: "12px" }}
                              >
                                {error}
                              </Alert>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email sx={{ color: "#3b82f6" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              background: isDarkMode
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.8)",
                              "&:hover fieldset": {
                                borderColor: "#3b82f6",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#3b82f6",
                              },
                            },
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock sx={{ color: "#3b82f6" }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              background: isDarkMode
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.8)",
                              "&:hover fieldset": {
                                borderColor: "#3b82f6",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#3b82f6",
                              },
                            },
                          }}
                        />

                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Link
                            href="#"
                            sx={{
                              color: "#3b82f6",
                              textDecoration: "none",
                              fontWeight: 500,
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            Forgot password?
                          </Link>
                        </Box>

                        <PremiumButton
                          type="submit"
                          fullWidth
                          size="large"
                          loading={loading}
                          gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                          glow
                          icon={<LoginIcon />}
                          sx={{ py: 2, borderRadius: "12px" }}
                        >
                          Sign In to MediAI Pro
                        </PremiumButton>

                        <Divider sx={{ my: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode
                                ? "rgba(255,255,255,0.5)"
                                : "#94a3b8",
                              px: 2,
                            }}
                          >
                            New to MediAI Pro?
                          </Typography>
                        </Divider>

                        <PremiumButton
                          fullWidth
                          variant="outlined"
                          size="large"
                          onClick={() => navigate("/signup")}
                          icon={<ArrowForward />}
                          sx={{
                            py: 2,
                            borderRadius: "12px",
                            borderColor: "#3b82f6",
                            color: "#3b82f6",
                            "&:hover": {
                              borderColor: "#1d4ed8",
                              background: "rgba(59, 130, 246, 0.05)",
                            },
                          }}
                        >
                          Create Professional Account
                        </PremiumButton>
                      </Stack>
                    </form>

                    {/* Footer */}
                    <Box sx={{ mt: 4, textAlign: "center" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDarkMode
                            ? "rgba(255,255,255,0.5)"
                            : "#94a3b8",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        Protected by enterprise-grade security
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Chip
                          label="HIPAA"
                          size="small"
                          sx={{
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#10b981",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                          }}
                        />
                        <Chip
                          label="SOC 2"
                          size="small"
                          sx={{
                            background: "rgba(59, 130, 246, 0.1)",
                            color: "#3b82f6",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                          }}
                        />
                        <Chip
                          label="ISO 27001"
                          size="small"
                          sx={{
                            background: "rgba(139, 92, 246, 0.1)",
                            color: "#8b5cf6",
                            border: "1px solid rgba(139, 92, 246, 0.2)",
                          }}
                        />
                      </Stack>
                    </Box>
                  </motion.div>
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ProfessionalLogin;
