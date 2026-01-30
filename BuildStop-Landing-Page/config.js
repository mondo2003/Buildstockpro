/**
 * BuildStop Pro - Configuration
 *
 * This file contains environment-specific configuration for the BuildStop landing page.
 *
 * DEVELOPMENT:
 * - The app will automatically use http://localhost:3000 when running locally
 *
 * PRODUCTION:
 * - Change APP_BASE_URL to your production domain
 * - Change APP_BASE_URL below before deploying
 */

// Auto-detect environment or use explicit configuration
const APP_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://buildstock-landing.vercel.app'; // Stay on landing page for now

// Supabase Edge Functions URL
const API_URL = 'https://xrhlumtimbmglzrfrnnk.supabase.co/functions/v1';

// Alternative: Explicitly set the URL (comment out auto-detection above and uncomment below)
// const APP_BASE_URL = 'https://buildstock.pro'; // Production URL
// const APP_BASE_URL = 'http://localhost:3000'; // Development URL

// Make available globally
window.APP_BASE_URL = APP_BASE_URL;
window.API_URL = API_URL;

// Log current configuration in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('BuildStop Pro Config: Running in DEVELOPMENT mode');
    console.log('App URL:', APP_BASE_URL);
    console.log('API URL:', API_URL);
} else {
    console.log('BuildStop Pro Config: Running in PRODUCTION mode');
    console.log('App URL:', APP_BASE_URL);
    console.log('API URL:', API_URL);
}
