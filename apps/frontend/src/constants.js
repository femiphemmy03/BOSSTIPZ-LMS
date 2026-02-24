export const COLORS = {
  primary: '#FF7A00',
  background: '#FFFFFF',
  text: '#000000'
};

export const API = {
  backend: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
  frontend: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  flutterwavePublicKey: import.meta.env.VITE_FLW_PUBLIC_KEY || ''
};
