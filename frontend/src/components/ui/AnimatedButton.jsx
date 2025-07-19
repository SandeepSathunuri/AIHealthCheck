import React, { useState } from "react";
import { Button, Box, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeMode } from "../../context/ThemeContext";

const AnimatedButton = ({
  children,
  variant = "contained",
  size = "large",
  loading = false,
  success = false,
  error = false,
  gradient,
  glowEffect = false,
  rippleEffect = true,
  onClick,
  disabled,
  startIcon,
  endIcon,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);
  const { isDarkMode } = useThemeMode();

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {},
    tap: {},
  };

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: [0, 0.6, 0],
      scale: [0.8, 1.2, 1.4],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const iconVariants = {
    initial: { x: 0 },
    hover: { x: 4 },
    loading: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const handleClick = (event) => {
    if (rippleEffect && !disabled && !loading) {
      const rect = event.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple = {
        x,
        y,
        size,
        id: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) =>
          prev.filter((ripple) => ripple.id !== newRipple.id)
        );
      }, 600);
    }

    if (onClick) {
      onClick(event);
    }
  };

  // Theme-aware gradient definitions
  const getThemeGradients = () => {
    if (isDarkMode) {
      return {
        primary: gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        success: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        error: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
        secondary: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        accent: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
      };
    } else {
      return {
        primary: gradient || "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        success: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        error: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        secondary: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        accent: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
      };
    }
  };

  const getButtonColor = () => {
    const gradients = getThemeGradients();
    if (error) return gradients.error;
    if (success) return gradients.success;
    return gradients.primary;
  };

  // Theme-aware colors for different states
  const getThemeColors = () => {
    if (isDarkMode) {
      return {
        text: "#ffffff",
        textSecondary: "rgba(255, 255, 255, 0.7)",
        disabled: "rgba(255, 255, 255, 0.3)",
        disabledBg: "rgba(255, 255, 255, 0.08)",
        ripple: "rgba(255, 255, 255, 0.3)",
        shadow: "rgba(0, 0, 0, 0.5)",
      };
    } else {
      return {
        text: "#ffffff",
        textSecondary: "rgba(255, 255, 255, 0.9)",
        disabled: "rgba(255, 255, 255, 0.6)",
        disabledBg: "rgba(0, 0, 0, 0.12)",
        ripple: "rgba(255, 255, 255, 0.4)",
        shadow: "rgba(0, 0, 0, 0.2)",
      };
    }
  };

  const getButtonContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} color="inherit" />
          Processing...
        </Box>
      );
    }

    if (success) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            ✓
          </motion.div>
          Success!
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            ⚠
          </motion.div>
          Try Again
        </Box>
      );
    }

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {startIcon && (
          <motion.div variants={iconVariants}>{startIcon}</motion.div>
        )}
        {children}
        {endIcon && <motion.div variants={iconVariants}>{endIcon}</motion.div>}
      </Box>
    );
  };

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      {/* Glow effect */}
      {glowEffect && (
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "100%",
            background: getButtonColor(),
            borderRadius: 12,
            filter: "blur(20px)",
            zIndex: -1,
          }}
        />
      )}

      <motion.div
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onTapStart={() => setIsPressed(true)}
        onTapCancel={() => setIsPressed(false)}
        onTap={() => setIsPressed(false)}
      >
        <Button
          {...props}
          variant={variant}
          size={size}
          disabled={disabled || loading}
          onClick={handleClick}
          sx={{
            position: "relative",
            overflow: "hidden",
            background:
              variant === "contained" ? getButtonColor() : "transparent",
            border: variant === "outlined" ? `2px solid transparent` : "none",
            backgroundImage: variant === "outlined" ? getButtonColor() : "none",
            backgroundOrigin: "border-box",
            backgroundClip:
              variant === "outlined"
                ? "padding-box, border-box"
                : "padding-box",
            borderRadius: 3,
            fontWeight: 600,
            textTransform: "none",
            color: getThemeColors().text,
            minHeight: size === "large" ? 56 : size === "medium" ? 48 : 40,
            px: size === "large" ? 4 : size === "medium" ? 3 : 2,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: isDarkMode 
              ? `0 4px 20px ${getThemeColors().shadow}` 
              : `0 2px 10px ${getThemeColors().shadow}`,
            "&:hover": {
              background:
                variant === "contained" ? getButtonColor() : "transparent",
              filter: "brightness(1.1)",
              transform: "translateY(-2px)",
              boxShadow: isDarkMode 
                ? `0 8px 30px ${getThemeColors().shadow}` 
                : `0 4px 20px ${getThemeColors().shadow}`,
            },
            "&:active": {
              transform: "translateY(0px)",
            },
            "&:disabled": {
              background: getThemeColors().disabledBg,
              color: getThemeColors().disabled,
              boxShadow: "none",
            },
            ...props.sx,
          }}
        >
          {/* Ripple effects */}
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.div
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  left: ripple.x,
                  top: ripple.y,
                  width: ripple.size,
                  height: ripple.size,
                  borderRadius: "50%",
                  background: getThemeColors().ripple,
                  pointerEvents: "none",
                }}
              />
            ))}
          </AnimatePresence>

          {/* Button content */}
          <motion.div
            animate={loading ? "loading" : "initial"}
            variants={iconVariants}
          >
            {getButtonContent()}
          </motion.div>
        </Button>
      </motion.div>
    </Box>
  );
};

export default AnimatedButton;
