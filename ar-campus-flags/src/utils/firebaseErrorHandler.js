// src/utils/firebaseErrorHandler.js

/**
 * Helper function to parse and format Firebase error messages
 * @param {Error} error - The error object from Firebase
 * @returns {string} A user-friendly error message
 */
export const parseFirebaseError = (error) => {
    console.error('Firebase Error:', error);
    
    // Check if it's a Firebase error with a code
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          return 'You don\'t have permission to perform this action. Please check your Firebase rules.';
        case 'unavailable':
          return 'The service is currently unavailable. Please check your internet connection and try again.';
        case 'not-found':
          return 'The requested resource was not found.';
        case 'already-exists':
          return 'The document already exists.';
        case 'resource-exhausted':
          return 'You\'ve reached the quota limit. Please try again later.';
        case 'cancelled':
          return 'The operation was cancelled.';
        case 'invalid-argument':
          return 'Invalid data was provided to the operation.';
        case 'deadline-exceeded':
          return 'The operation timed out. Please try again.';
        default:
          return `Firebase error: ${error.code}. ${error.message || ''}`;
      }
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      return 'Network error. Please check your internet connection.';
    }
    
    // Handle generic errors
    return error.message || 'An unexpected error occurred. Please try again.';
  };
  
  /**
   * Logs detailed Firebase error information for debugging
   * @param {Error} error - The error object from Firebase
   * @param {string} operation - The operation that was being performed
   */
  export const logFirebaseError = (error, operation) => {
    console.group(`Firebase Error (${operation})`);
    console.error('Error object:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    
    if (error.serverResponse) {
      try {
        console.error('Server response:', JSON.parse(error.serverResponse));
      } catch {
        console.error('Server response (raw):', error.serverResponse);
      }
    }
    
    console.groupEnd();
  };