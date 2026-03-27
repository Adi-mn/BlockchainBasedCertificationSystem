// Dynamic API URL configuration for network access
const getApiUrl = () => {
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  console.log('🔍 Current hostname:', currentHost);
  console.log('🔍 Current port:', currentPort);
  
  // If accessing via IP address (hotspot scenario)
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1' && currentHost !== '') {
    const apiUrl = `http://${currentHost}:5000/api`;
    console.log('🌐 Using IP-based API URL:', apiUrl);
    return apiUrl;
  }
  
  // Default to environment variable or localhost
  const defaultUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  console.log('🌐 Using default API URL:', defaultUrl);
  return defaultUrl;
};

export const API_URL = getApiUrl();

// For debugging - log the final API URL
console.log('🎯 Final API URL:', API_URL);