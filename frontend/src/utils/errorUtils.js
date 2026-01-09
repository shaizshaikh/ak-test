// Utility functions for handling error messages

/**
 * Clean error messages by removing URLs and sensitive information
 * @param {string} message - The error message to clean
 * @returns {string} - The cleaned error message
 */
export const cleanErrorMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return 'Unknown error occurred';
  }
  
  // Remove URLs from error messages
  let cleanMessage = message.replace(/https?:\/\/[^\s]+/g, '[URL]');
  
  // Remove file paths
  cleanMessage = cleanMessage.replace(/[A-Za-z]:\\[^\s]+/g, '[PATH]');
  
  // Remove IP addresses
  cleanMessage = cleanMessage.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');
  
  // Truncate very long messages
  if (cleanMessage.length > 200) {
    cleanMessage = cleanMessage.substring(0, 200) + '...';
  }
  
  return cleanMessage;
};

/**
 * Extract a user-friendly error message from an axios error
 * @param {Error} error - The axios error object
 * @returns {string} - A clean, user-friendly error message
 */
export const getCleanErrorMessage = (error) => {
  let message = 'An unexpected error occurred';
  
  if (error.response) {
    // Server responded with error status
    message = error.response.data?.message || 
              error.response.data?.error || 
              error.response.statusText || 
              `Server error (${error.response.status})`;
  } else if (error.request) {
    // Request was made but no response received
    message = 'Unable to connect to server. Please check your internet connection.';
  } else if (error.message) {
    // Something else happened
    message = error.message;
  }
  
  return cleanErrorMessage(message);
};