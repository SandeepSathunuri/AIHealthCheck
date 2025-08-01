/**
 * Utility functions for handling success and error messages
 */

export const handleSuccess = (message) => {
  console.log('Success:', message);
  // You can integrate with toast notifications here
  // For now, we'll just log to console
};

export const handleError = (message) => {
  console.error('Error:', message);
  // You can integrate with toast notifications here
  // For now, we'll just log to console
};