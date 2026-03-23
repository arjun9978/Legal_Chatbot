import axios from 'axios'

// Get API URL from environment variable
// Vite uses .env for development and .env.production for production builds
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Export the base URL for components that use fetch instead of axios
export const getApiUrl = () => API_URL

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
