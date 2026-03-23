import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dsa_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Only force-redirect on 401 for non-auth endpoints.
    // /auth/me and /auth/login failures are handled by their callers.
    const url = error.config?.url ?? ''
    const isAuthEndpoint = url.includes('/auth/')
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('dsa_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
