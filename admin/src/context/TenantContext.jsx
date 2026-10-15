import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null)
  const [structures, setStructures] = useState([])
  const [sites, setSites] = useState([])
  const [activeStructure, setActiveStructure] = useState(null) // null = all structures
  const [activeSite, setActiveSite] = useState(null) // null = all sites

  useEffect(() => {
    const stored = localStorage.getItem('rv_tenant')
    if (stored) {
      try {
        setTenant(JSON.parse(stored))
      } catch {
        localStorage.removeItem('rv_tenant')
      }
    }

    const storedFilter = localStorage.getItem('rv_site_filter')
    if (storedFilter) {
      try {
        const filter = JSON.parse(storedFilter)
        setActiveStructure(filter.structure || null)
        setActiveSite(filter.site || null)
      } catch {}
    }
  }, [])

  // Load structures and sites when tenant is set
  useEffect(() => {
    if (!tenant?.id) return
    loadStructures()
  }, [tenant?.id])

  async function loadStructures() {
    const [structRes, siteRes] = await Promise.all([
      api.get('/v1/tenant/structures'),
      api.get('/v1/tenant/sites')
    ])
    if (structRes.success) setStructures(structRes.data || [])
    if (siteRes.success) setSites(siteRes.data || [])
  }

  function switchTenant(t) {
    setTenant(t)
    localStorage.setItem('rv_tenant', JSON.stringify(t))
    localStorage.removeItem('rv_site_filter')
    setActiveStructure(null)
    setActiveSite(null)
    window.location.reload()
  }

  function switchStructure(structure) {
    setActiveStructure(structure)
    setActiveSite(null) // reset site when switching structure
    const filter = { structure: structure || null, site: null }
    localStorage.setItem('rv_site_filter', JSON.stringify(filter))
  }

  function switchSite(site) {
    setActiveSite(site)
    const filter = { structure: activeStructure || null, site: site || null }
    localStorage.setItem('rv_site_filter', JSON.stringify(filter))
  }

  // Build query params for API calls filtered by structure/site
  function getFilterParams() {
    const params = {}
    if (activeStructure?.id) params.structure_id = activeStructure.id
    if (activeSite?.id) params.site_id = activeSite.id
    return params
  }

  function getFilterQuery() {
    const parts = []
    if (activeStructure?.id) parts.push(`structure_id=${activeStructure.id}`)
    if (activeSite?.id) parts.push(`site_id=${activeSite.id}`)
    return parts.length ? `&${parts.join('&')}` : ''
  }

  const hasMultipleStructures = structures.length > 1

  return (
    <TenantContext.Provider value={{
      tenant, switchTenant,
      structures, sites,
      activeStructure, activeSite,
      switchStructure, switchSite,
      getFilterParams, getFilterQuery,
      hasMultipleStructures
    }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within TenantProvider')
  return ctx
}
