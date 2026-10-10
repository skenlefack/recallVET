import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTenant } from '../context/TenantContext'

const menuSections = [
  {
    title: 'PRINCIPAL',
    items: [
      { title: 'Tableau de bord', icon: 'fas fa-tachometer-alt', to: '/dashboard' },
      { title: 'Analytiques', icon: 'fas fa-chart-bar', to: '/analytics' }
    ]
  },
  {
    title: 'CLINIQUE',
    items: [
      { title: 'Clients', icon: 'fas fa-users', to: '/clinic/parties' },
      { title: 'Animaux', icon: 'fas fa-paw', to: '/clinic/animals' },
      { title: 'Rendez-vous', icon: 'fas fa-calendar-check', to: '/clinic/appointments' },
      { title: 'Calendrier', icon: 'fas fa-calendar-alt', to: '/clinic/calendar' },
      { title: 'Consultations', icon: 'fas fa-stethoscope', to: '/clinic/encounters' },
      { title: 'Vaccinations', icon: 'fas fa-syringe', to: '/clinic/vaccinations' },
      { title: 'Laboratoire', icon: 'fas fa-flask', to: '/clinic/lab' },
      { title: 'Protocoles', icon: 'fas fa-clipboard-list', to: '/clinic/protocols' },
      { title: 'Hospitalisations', icon: 'fas fa-procedures', to: '/clinic/hospitalizations' },
      { title: 'Chirurgies', icon: 'fas fa-cut', to: '/clinic/surgeries' },
      { title: 'Ordonnances', icon: 'fas fa-prescription', to: '/clinic/prescriptions' },
      { title: 'Factures', icon: 'fas fa-file-invoice-dollar', to: '/clinic/invoices' }
    ]
  },
  {
    title: 'ELEVAGE',
    items: [
      { title: 'Exploitations', icon: 'fas fa-tractor', to: '/farm/farms' },
      { title: 'Troupeaux', icon: 'fas fa-horse', to: '/farm/herds' },
      { title: 'Visites', icon: 'fas fa-clipboard-list', to: '/farm/visits' },
      { title: 'Evenements sanitaires', icon: 'fas fa-exclamation-triangle', to: '/farm/health-events' }
    ]
  },
  {
    title: 'PHARMACIE',
    items: [
      { title: 'Produits', icon: 'fas fa-pills', to: '/pharmacy/products' },
      { title: 'Fournisseurs', icon: 'fas fa-truck', to: '/pharmacy/suppliers' },
      { title: 'Bons de commande', icon: 'fas fa-shopping-cart', to: '/pharmacy/purchase-orders' },
      { title: 'Stock', icon: 'fas fa-boxes', to: '/pharmacy/stock' },
      { title: 'Mouvements stock', icon: 'fas fa-exchange-alt', to: '/pharmacy/stock/movements' },
      { title: 'Dispensation', icon: 'fas fa-prescription-bottle-alt', to: '/pharmacy/dispensing' },
      { title: 'Ventes', icon: 'fas fa-cash-register', to: '/pharmacy/sales' }
    ]
  },
  {
    title: 'PARAMETRES',
    items: [
      { title: 'Profil', icon: 'fas fa-user-cog', to: '/settings/profile' },
      { title: 'Etablissement', icon: 'fas fa-building', to: '/settings/tenant' },
      { title: 'Données référence', icon: 'fas fa-database', to: '/settings/reference' },
      { title: 'Utilisateurs', icon: 'fas fa-user-friends', to: '/settings/team' },
      { title: 'Abonnement', icon: 'fas fa-crown', to: '/settings/subscription' }
    ]
  }
]

const superadminSection = {
  title: 'SUPER ADMIN',
  items: [
    { title: 'Vue plateforme', icon: 'fas fa-chart-line', to: '/superadmin/dashboard' },
    { title: 'Tenants', icon: 'fas fa-sitemap', to: '/superadmin/tenants' },
    { title: 'Abonnements', icon: 'fas fa-credit-card', to: '/superadmin/subscriptions' },
    { title: 'Utilisateurs', icon: 'fas fa-users-cog', to: '/superadmin/users' },
    { title: 'Demandes demo', icon: 'fas fa-envelope-open-text', to: '/superadmin/demo-requests' },
    { title: 'Messages', icon: 'fas fa-inbox', to: '/superadmin/contacts' },
    { title: 'Journal d\'audit', icon: 'fas fa-history', to: '/superadmin/audit-log' }
  ]
}

export default function Sidebar({ isOpen, toggle }) {
  const { user } = useAuth()
  const { tenant } = useTenant()
  const [openSections, setOpenSections] = useState({})

  const toggleSection = (title) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }))
  }

  const allSections = user?.role === 'superadmin' ? [...menuSections, superadminSection] : menuSections

  return (
    <nav className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <i className="fas fa-paw" />
        </div>
        {isOpen && <span className="sidebar-brand-text">RecallVET</span>}
      </div>

      {/* Tenant info */}
      {isOpen && tenant && (
        <div className="sidebar-tenant">
          <i className="fas fa-building me-1" style={{ fontSize: '0.65rem' }} />
          <span>{tenant.name}</span>
        </div>
      )}

      {/* Menu */}
      <div className="sidebar-menu">
        {allSections.map((section) => (
          <div key={section.title} className="sidebar-section">
            {isOpen && (
              <div className="sidebar-section-title" onClick={() => toggleSection(section.title)}>
                {section.title}
                <i className={`fas fa-chevron-${openSections[section.title] === false ? 'right' : 'down'}`} />
              </div>
            )}
            {openSections[section.title] !== false && section.items.map((item) => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title={item.title}>
                <i className={item.icon} />
                {isOpen && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </nav>
  )
}
