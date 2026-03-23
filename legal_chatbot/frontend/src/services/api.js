import axios from 'axios'

// Production API URL (Render backend)
const PRODUCTION_API_URL = 'https://legal-chatbot-backend-5e7v.onrender.com/api'

// Use production URL if on Vercel, otherwise use localhost for development
const isProduction = window.location.hostname !== 'localhost'
const baseURL = isProduction ? PRODUCTION_API_URL : 'http://localhost:5000/api'

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
