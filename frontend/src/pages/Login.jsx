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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
  Apple,
  GitHub,
  ArrowForward,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "../styles/theme";
import GlassCard from "../components/ui/GlassCard";
import AnimatedButton from "../components/ui/AnimatedButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FloatingParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => i);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle}
          style={{
            position: "absolute",
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </Box>
  );
};

const SocialLoginButton = ({ icon, label, onClick, gradient }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <AnimatedButton
      fullWidth
      variant="outlined"
      startIcon={icon}
      onClick={onClick}
      sx={{
        borderColor: "rgba(255, 255, 255, 0.2)",
        color: "white",
        background: "rgba(255, 255, 255, 0.05)",
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.4)",
          background: "rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      {label}
    </AnimatedButton>
  </motion.div>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = darkTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0a0a1e 0%, #1a1a3a 50%, #2d1b69 100%)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Animated Background */}
        <FloatingParticles />

        {/* Background Gradients */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.4), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.4), transparent 50%)",
            zIndex: 0,
          }}
        />

        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <GlassCard
              padding={isMobile ? 3 : 4}
              glowEffect
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            >
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <motion.div variants={itemVariants}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 1,
                    }}
                  >
                    Welcome Back
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="body1"
                    sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    Sign in to your Medical AI account
                  </Typography>
                </motion.div>
              </Box>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Box component="form" onSubmit={handleSubmit}>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    required
                    sx={{ mb: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <AnimatedButton
                    type="submit"
                    fullWidth
                    size="large"
                    loading={loading}
                    success={success}
                    gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    glowEffect
                    endIcon={<ArrowForward />}
                    sx={{ mb: 3 }}
                  >
                    Sign In
                  </AnimatedButton>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Link
                      href="#"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        textDecoration: "none",
                        "&:hover": {
                          color: "white",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Divider
                    sx={{
                      mb: 3,
                      "&::before, &::after": {
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                    >
                      Or continue with
                    </Typography>
                  </Divider>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <SocialLoginButton
                      icon={<Google />}
                      label="Google"
                      onClick={() => console.log("Google login")}
                    />
                    <SocialLoginButton
                      icon={<GitHub />}
                      label="GitHub"
                      onClick={() => console.log("GitHub login")}
                    />
                  </Box>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Don't have an account?{" "}
                      <Link
                        onClick={() => navigate("/signup")}
                        sx={{
                          color: "#667eea",
                          textDecoration: "none",
                          fontWeight: 600,
                          cursor: "pointer",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        Sign up
                      </Link>
                    </Typography>
                  </Box>
                </motion.div>
              </Box>
            </GlassCard>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
