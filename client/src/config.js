// Get the current hostname dynamically
const getBaseUrl = () => {
    if (window.ENV?.VITE_API_URL) return window.ENV.VITE_API_URL;
    
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If it's localhost, use the default port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    
    // For production/Cloud Run, use the same origin
    return `${protocol}//${hostname}`;
  };
  
  const API_URL = getBaseUrl();
  
  export { API_URL };