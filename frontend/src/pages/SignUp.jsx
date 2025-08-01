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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  LocalHospital,
  Security,
  Verified,
  ArrowForward,
  PersonAdd,
  CheckCircle,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@mui/material/styles";
import {
  premiumTheme,
  premiumLightTheme,
} from "../styles/premiumTheme";
import PremiumButton from "../components/ui/PremiumButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";

const ProfessionalSignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDarkMode } = useThemeMode();

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate("/");
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: <Security />, text: "Enterprise Security", desc: "Bank-level encryption" },
    { icon: <Verified />, text: "HIPAA Compliant", desc: "Medical data protection" },
    { icon: <LocalHospital />, text: "AI Powered", desc: "Advanced medical analysis" },
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
          py: 4,
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}
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
                  isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
                }`,
                boxShadow: isDarkMode
                  ? "0 25px 50px rgba(0, 0, 0, 0.3)"
                  : "0 25px 50px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Left Panel - Registration Form */}
              <Box sx={{ p: 6 }}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
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
                      Join MediAI Pro
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: isDarkMode ? "rgba(255,255,255,0.7)" : "#64748b",
                      }}
                    >
                      Create your professional medical AI account
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
                            <Alert severity="error" sx={{ borderRadius: "12px" }}>
                              {error}
                            </Alert>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <TextField
                        fullWidth
                        label="Full Name"
                        value={formData.name}
                        onChange={handleChange("name")}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: "#3b82f6" }} />
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
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange("email")}
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
                        value={formData.password}
                        onChange={handleChange("password")}
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
                                {showPassword ? <VisibilityOff /> : <Visibility />}
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

                      <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange("confirmPassword")}
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
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            sx={{
                              color: "#3b82f6",
                              "&.Mui-checked": {
                                color: "#3b82f6",
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ color: isDarkMode ? "rgba(255,255,255,0.7)" : "#64748b" }}>
                            I agree to the{" "}
                            <Link href="#" sx={{ color: "#3b82f6", textDecoration: "none" }}>
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="#" sx={{ color: "#3b82f6", textDecoration: "none" }}>
                              Privacy Policy
                            </Link>
                          </Typography>
                        }
                      />

                      <PremiumButton
                        type="submit"
                        fullWidth
                        size="large"
                        loading={loading}
                        gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        glow
                        icon={<PersonAdd />}
                        sx={{ py: 2, borderRadius: "12px" }}
                      >
                        Create Professional Account
                      </PremiumButton>

                      <Divider sx={{ my: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkMode ? "rgba(255,255,255,0.5)" : "#94a3b8",
                            px: 2,
                          }}
                        >
                          Already have an account?
                        </Typography>
                      </Divider>

                      <PremiumButton
                        fullWidth
                        variant="outlined"
                        size="large"
                        onClick={() => navigate("/login")}
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
                        Sign In Instead
                      </PremiumButton>
                    </Stack>
                  </form>
                </motion.div>
              </Box>

              {/* Right Panel - Benefits */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                      }}
                    >
                      Why Choose MediAI Pro?
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        opacity: 0.9,
                        mb: 4,
                        lineHeight: 1.6,
                      }}
                    >
                      Join thousands of healthcare professionals using our advanced AI platform for medical analysis.
                    </Typography>
                  </motion.div>

                  {/* Benefits */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Stack spacing={3}>
                      {benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              p: 3,
                              borderRadius: "16px",
                              background: "rgba(255, 255, 255, 0.1)",
                              backdropFilter: "blur(10px)",
                              textAlign: "left",
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                background: "rgba(255, 255, 255, 0.2)",
                              }}
                            >
                              {React.cloneElement(benefit.icon, { sx: { fontSize: 24 } })}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {benefit.text}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {benefit.desc}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>
                      ))}
                    </Stack>
                  </motion.div>

                  {/* Trust Indicators */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                  >
                    <Box sx={{ mt: 4 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.8,
                          mb: 2,
                        }}
                      >
                        Trusted by 10,000+ healthcare professionals
                      </Typography>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Chip
                          label="HIPAA"
                          size="small"
                          sx={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                          }}
                        />
                        <Chip
                          label="SOC 2"
                          size="small"
                          sx={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                          }}
                        />
                        <Chip
                          label="ISO 27001"
                          size="small"
                          sx={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                          }}
                        />
                      </Stack>
                    </Box>
                  </motion.div>
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ProfessionalSignUp;