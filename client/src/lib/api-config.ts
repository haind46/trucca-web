/**
 * API Configuration
 * Centralized configuration for API base URL
 */

// Get config from meta tags (injected at runtime) or from build-time env vars
const getMetaContent = (name: string): string | null => {
  const meta = document.querySelector(`meta[name="${name}"]`);
  return meta?.getAttribute('content') || null;
};

// Get backend URL from environment or meta tag
const backendUrl = getMetaContent('vite-backend-url') ||
                   import.meta.env.VITE_BACKEND_URL ||
                   '';

// Determine if using direct connection or nginx proxy
const isDevelopment = backendUrl && (
  backendUrl.includes('localhost') ||
  backendUrl.includes('127.0.0.1')
);

// Export API base URL
export const API_BASE_URL = isDevelopment ? backendUrl : '';

// Export API base path
export const API_BASE = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

// Log configuration (useful for debugging)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:');
  console.log('  Base URL:', API_BASE_URL || '(empty - using nginx proxy)');
  console.log('  API Base:', API_BASE);
  console.log('  Mode:', isDevelopment ? 'Direct connection' : 'Nginx proxy');
}
