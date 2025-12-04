/**
 * API configuration for backend endpoints
 * Automatically detects environment and uses appropriate base URL
 */

// Determine the API base URL based on the environment
const getApiBaseUrl = (): string => {
    // If running on localhost (development), use localhost:3000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    // If running on the server, use the server's IP with port 3000
    return `http://${window.location.hostname}:3000`;
};

export const API_BASE_URL = getApiBaseUrl();
