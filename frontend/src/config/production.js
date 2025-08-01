/**
 * Production Configuration for Medical AI Platform
 * FAANG-Level Deployment Ready Settings
 */

export const productionConfig = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://aihealthcheck-zzqr.onrender.com',
  
  // Feature Flags
  FEATURES: {
    ANALYTICS: false, // Disabled as requested
    VOICE_RECORDING: true,
    IMAGE_UPLOAD: true,
    EDIT_MODE: true,
    PROFILE_EDIT: true,
    DARK_MODE: true,
    PREMIUM_UI: true,
  },

  // Performance Settings
  PERFORMANCE: {
    LAZY_LOADING: true,
    IMAGE_OPTIMIZATION: true,
    ANIMATION_REDUCED_MOTION: false,
    PREFETCH_ROUTES: true,
  },

  // Security Settings
  SECURITY: {
    HTTPS_ONLY: true,
    SECURE_COOKIES: true,
    CSP_ENABLED: true,
  },

  // UI Settings
  UI: {
    THEME: {
      DEFAULT_MODE: 'dark',
      PERSIST_THEME: true,
      PREMIUM_ANIMATIONS: true,
    },
    SIDEBAR: {
      DEFAULT_COLLAPSED: false,
      PERSIST_STATE: true,
    },
  },

  // File Upload Limits
  UPLOAD: {
    MAX_IMAGE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_AUDIO_SIZE: 25 * 1024 * 1024, // 25MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/webm'],
  },

  // Error Handling
  ERROR_HANDLING: {
    SHOW_STACK_TRACE: false,
    LOG_ERRORS: true,
    RETRY_ATTEMPTS: 3,
  },

  // Analytics (Disabled)
  ANALYTICS: {
    ENABLED: false,
    GOOGLE_ANALYTICS: null,
    MIXPANEL: null,
  },
};

export default productionConfig;