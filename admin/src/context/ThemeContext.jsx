import { createContext, useContext, useState, useEffect } from 'react'
import { api, getToken } from '../services/api'

const ThemeContext = createContext(null)

const DEFAULT_PRIMARY = '#2563eb'
const DEFAULT_SECONDARY = '#1e40af'

function applyColors(primary, secondary) {
  document.documentElement.style.setProperty('--rv-primary', primary || DEFAULT_PRIMARY)
  document.documentElement.style.setProperty('--rv-secondary', secondary || DEFAULT_SECONDARY)
}

export function ThemeProvider({ children }) {
  const [colors, setColors] = useState({
    primary: DEFAULT_PRIMARY,
    secondary: DEFAULT_SECONDARY
  })

  useEffect(() => {
    loadTenantColors()
  }, [])

  const loadTenantColors = async () => {
    const token = getToken()
    if (!token) {
      applyColors(DEFAULT_PRIMARY, DEFAULT_SECONDARY)
      return
    }
    try {
      const res = await api.get('/v1/tenant', token)
      if (res.success && res.data) {
        const primary = res.data.primary_color || DEFAULT_PRIMARY
        const secondary = res.data.secondary_color || DEFAULT_SECONDARY
        setColors({ primary, secondary })
        applyColors(primary, secondary)
      }
    } catch {
      applyColors(DEFAULT_PRIMARY, DEFAULT_SECONDARY)
    }
  }

  const updateColors = (primary, secondary) => {
    setColors({ primary, secondary })
    applyColors(primary, secondary)
  }

  return (
    <ThemeContext.Provider value={{ colors, updateColors, refreshColors: loadTenantColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
