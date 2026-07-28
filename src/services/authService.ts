import api from './api'

export interface RegisterData {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  contact: string
  location: string
  date_of_birth: string
}

export interface LoginData {
  username: string
  password: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  other_name: string
  gender: string
  contact: string | null
  country_code: string | null
  location: string | null
  date_of_birth: string | null
  is_subscribed: boolean
  is_staff: boolean
  is_active: boolean
  date_joined: string
}

export interface AuthResponse {
  user: User
  access: string
  refresh: string
}

const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/api/v1/auth/register/', data)
    return response.data
  },

  async login(data: LoginData): Promise<{ access: string; refresh: string }> {
    const response = await api.post('/api/v1/auth/login/', data)
    return response.data
  },

  async me(): Promise<User> {
    const response = await api.get('/api/v1/auth/me/')
    return response.data
  },

  async refreshToken(refresh: string): Promise<{ access: string }> {
    const response = await api.post('/api/v1/auth/refresh/', { refresh })
    return response.data
  },

  saveTokens(access: string, refresh: string) {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  },

  clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  },
}

export default authService