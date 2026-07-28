import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import authService from '../services/authService'
import type { User } from '../services/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On app load, check if user is already logged in
  // useEffect(() => {
  //   const loadUser = async () => {
  //     if (authService.isAuthenticated()) {
  //       try {
  //         const userData = await authService.me()
  //         setUser(userData)
  //       } catch {
  //         authService.clearTokens()
  //       }
  //     }
  //     setIsLoading(false)
  //   }
  //   loadUser()
  // }, [])
useEffect(() => {
  const loadUser = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const userData = await authService.me()
      setUser(userData)
    } catch {
      authService.clearTokens()
    } finally {
      setIsLoading(false)
    }
  }
  loadUser()
}, [])

const login = async (username: string, password: string) => {
  const tokens = await authService.login({ username, password })
  authService.saveTokens(tokens.access, tokens.refresh)
  // Small wait to ensure localStorage is set before the next request
  await new Promise(resolve => setTimeout(resolve, 50))
  const userData = await authService.me()
  setUser(userData)
}

  const logout = () => {
    authService.clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}