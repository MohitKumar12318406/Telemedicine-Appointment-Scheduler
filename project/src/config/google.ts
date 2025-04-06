export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Google Maps configuration
export const GOOGLE_MAPS_CONFIG = {
  apiKey: GOOGLE_API_KEY,
  libraries: ['places', 'geometry'],
  version: 'weekly'
}; 