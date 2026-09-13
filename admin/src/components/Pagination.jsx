import { useState } from 'react'

export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange, itemName = 'elements', showItemsPerPage = true, itemsPerPageOptions = [10, 20, 50, 100] }) {
  if (totalPages <= 0) return null

  const getPageNumbers = () => {
    const pages = []
    const delta = 2
    const left = Math.max(2, currentPage - delta)
    const right = Math.min(totalPages - 1, currentPage + delta)

    pages.push(1)
    if (left > 2) pages.push('...')
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push('...')
    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  const start = (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
      <div className="d-flex align-items-center gap-2">
        <small className="text-muted" style={{ fontSize: '0.8rem' }}>
          {totalItems > 0 ? (
            <>Affichage <strong>{start}-{end}</strong> sur <strong>{totalItems}</strong> {itemName}</>
          ) : `0 ${itemName}`}
        </small>
        {showItemsPerPage && onItemsPerPageChange && (
          <select className="form-select form-select-sm" style={{ width: 'auto', fontSize: '0.78rem', borderRadius: '6px' }}
            value={itemsPerPage} onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}>
            {itemsPerPageOptions.map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        )}
      </div>
      {totalPages > 1 && (
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted d-none d-md-inline" style={{ fontSize: '0.75rem' }}>
            Page {currentPage}/{totalPages}
          </small>
          <nav>
            <ul className="pagination pagination-sm mb-0" style={{ gap: '2px' }}>
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(currentPage - 1)}
                  style={{ borderRadius: '6px', fontSize: '0.78rem' }}>&laquo;</button>
              </li>
              {getPageNumbers().map((p, i) => (
                <li key={i} className={`page-item ${p === currentPage ? 'active' : ''} ${p === '...' ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => p !== '...' && onPageChange(p)}
                    style={{
                      borderRadius: '6px', fontSize: '0.78rem', minWidth: '32px', textAlign: 'center',
                      ...(p === currentPage ? { background: 'linear-gradient(135deg, #1a8b3f 0%, #0d4f2b 100%)', borderColor: '#1a8b3f' } : {})
                    }}>
                    {p}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(currentPage + 1)}
                  style={{ borderRadius: '6px', fontSize: '0.78rem' }}>&raquo;</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}
