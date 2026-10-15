import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import { clearOfflineData } from '../services/offlineDb'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('rv_user')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.token) {
          setToken(data.token)
          setUser(data.user)
          setTenants(data.tenants || [])
          // Verify token is still valid
          verifyToken(data.token)
        } else {
          setLoading(false)
        }
      } catch {
        localStorage.removeItem('rv_user')
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  async function verifyToken(t) {
    try {
      const res = await api.get('/auth/me', t)
      if (res.success) {
        setUser(res.data.user)
        setTenants(res.data.tenants || [])
      } else {
        logout()
      }
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    if (res.success) {
      const { token: t, refreshToken, user: u, tenants: ts } = res.data
      setToken(t)
      setUser(u)
      setTenants(ts || [])
      localStorage.setItem('rv_user', JSON.stringify({ token: t, refreshToken, user: u, tenants: ts }))
      // Auto-select first tenant
      if (ts && ts.length > 0) {
        localStorage.setItem('rv_tenant', JSON.stringify(ts[0]))
      }
    }
    return res
  }

  async function register(data) {
    const res = await api.post('/auth/register', data)
    if (res.success) {
      const { token: t, refreshToken, user: u, tenant } = res.data
      setToken(t)
      setUser(u)
      setTenants(tenant ? [tenant] : [])
      localStorage.setItem('rv_user', JSON.stringify({ token: t, refreshToken, user: u, tenants: tenant ? [tenant] : [] }))
      if (tenant) {
        localStorage.setItem('rv_tenant', JSON.stringify(tenant))
      }
    }
    return res
  }

  function logout() {
    setUser(null)
    setToken(null)
    setTenants([])
    localStorage.removeItem('rv_user')
    localStorage.removeItem('rv_tenant')
    clearOfflineData().catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ user, token, tenants, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
