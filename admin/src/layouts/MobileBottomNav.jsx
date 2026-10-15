import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/dashboard', icon: 'fas fa-home', label: 'Accueil' },
  { to: '/clinic/appointments', icon: 'fas fa-calendar-check', label: 'RDV' },
  { to: '/clinic/animals', icon: 'fas fa-paw', label: 'Animaux' },
  { to: '/clinic/encounters/new', icon: 'fas fa-plus-circle', label: 'Consult.', primary: true },
  { to: '/pharmacy/products', icon: 'fas fa-pills', label: 'Pharma' }
]

export default function MobileBottomNav() {
  return (
    <nav className="rv-mobile-nav">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `rv-mobile-tab ${isActive ? 'active' : ''} ${tab.primary ? 'primary' : ''}`}
        >
          <i className={tab.icon} />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
