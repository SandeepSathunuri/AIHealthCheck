/**
 * Performance Optimization Utilities
 * FAANG-Level Performance Enhancements
 */

// Image optimization utility
export const optimizeImage = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Debounce utility for search and input
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility for scroll and resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading utility
export const lazyLoad = (target, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  }, { ...defaultOptions, ...options });
  
  observer.observe(target);
  return observer;
};

// Memory cleanup utility
export const cleanup = {
  // Cleanup object URLs
  revokeObjectURL: (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  },
  
  // Cleanup event listeners
  removeEventListener: (element, event, handler) => {
    if (element && element.removeEventListener) {
      element.removeEventListener(event, handler);
    }
  },
  
  // Cleanup intervals and timeouts
  clearTimer: (timer) => {
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
    }
  },
};

// Performance monitoring
export const performanceMonitor = {
  // Measure function execution time
  measure: (name, fn) => {
    return async (...args) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    };
  },
  
  // Monitor component render time
  renderTime: (componentName) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${componentName} render took ${end - start} milliseconds`);
    };
  },
  
  // Memory usage monitoring
  memoryUsage: () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
      };
    }
    return null;
  },
};

// Error boundary utility
export const errorHandler = {
  // Log errors to console and external service
  logError: (error, errorInfo) => {
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
    
    // Send to error tracking service (Sentry, LogRocket, etc.)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { errorInfo }
      });
    }
  },
  
  // Network error handler
  handleNetworkError: (error) => {
    if (!navigator.onLine) {
      return 'You appear to be offline. Please check your internet connection.';
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return 'Network error. Please try again later.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  },
};

export default {
  optimizeImage,
  debounce,
  throttle,
  lazyLoad,
  cleanup,
  performanceMonitor,
  errorHandler,
};