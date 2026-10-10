import { useEffect } from 'react'

export default function Toast({ type = 'success', message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: 'fas fa-check-circle',
    danger: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }

  const colors = {
    success: { bg: '#f0fff4', border: '#c6f6d5', icon: '#38a169', text: '#22543d' },
    danger: { bg: '#fff5f5', border: '#fed7d7', icon: '#e53e3e', text: '#742a2a' },
    warning: { bg: '#fffff0', border: '#fefcbf', icon: '#d69e2e', text: '#744210' },
    info: { bg: '#ebf8ff', border: '#bee3f8', icon: '#3182ce', text: '#2a4365' }
  }

  const c = colors[type] || colors.info

  return (
    <div className="rv-toast-modern" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
      <i className={icons[type] || icons.info} style={{ color: c.icon, fontSize: '1.1rem', flexShrink: 0 }} />
      <span className="rv-toast-message">{message}</span>
      <button className="rv-toast-close" onClick={onClose} style={{ color: c.text }}>
        <i className="fas fa-times" />
      </button>
    </div>
  )
}
