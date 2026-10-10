import { createContext, useContext, useState, useEffect } from 'react'

const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('rv_tenant')
    if (stored) {
      try {
        setTenant(JSON.parse(stored))
      } catch {
        localStorage.removeItem('rv_tenant')
      }
    }
  }, [])

  function switchTenant(t) {
    setTenant(t)
    localStorage.setItem('rv_tenant', JSON.stringify(t))
    window.location.reload()
  }

  return (
    <TenantContext.Provider value={{ tenant, switchTenant }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within TenantProvider')
  return ctx
}
