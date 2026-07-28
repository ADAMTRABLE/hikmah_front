import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach access token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If token expires, try to refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')

      if (refresh) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh/`,
            { refresh }
          )
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          // Refresh failed — clear tokens and redirect to login only if on a protected page
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          const protectedRoutes = ['/admin']
          const isProtected = protectedRoutes.some(route =>
            window.location.pathname.startsWith(route)
          )
          if (isProtected) {
            window.location.href = '/login'
          }
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
