export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemName = 'éléments',
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 25, 50, 100]
}) {
  if (totalPages <= 0 && totalItems <= 0) return null

  const pages = totalPages || Math.ceil(totalItems / itemsPerPage) || 1

  const getPageNumbers = () => {
    const nums = []
    const delta = 1
    const left = Math.max(2, currentPage - delta)
    const right = Math.min(pages - 1, currentPage + delta)

    nums.push(1)
    if (left > 2) nums.push('...')
    for (let i = left; i <= right; i++) nums.push(i)
    if (right < pages - 1) nums.push('...')
    if (pages > 1) nums.push(pages)
    return nums
  }

  const start = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const end = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="rv-pagination">
      {/* Left: summary + per page selector */}
      <div className="rv-pagination-left">
        <span className="rv-pagination-summary">
          {totalItems > 0 ? (
            <><strong>{start}</strong>–<strong>{end}</strong> sur <strong>{totalItems}</strong> {itemName}</>
          ) : (
            <>0 {itemName}</>
          )}
        </span>
        {showItemsPerPage && onItemsPerPageChange && (
          <select
            className="rv-pagination-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
          >
            {itemsPerPageOptions.map(n => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
        )}
      </div>

      {/* Right: page buttons */}
      {pages > 1 && (
        <div className="rv-pagination-right">
          {/* First page */}
          <button
            className="rv-page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            title="Première page"
          >
            <i className="fas fa-angles-left" />
          </button>

          {/* Previous */}
          <button
            className="rv-page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            title="Page précédente"
          >
            <i className="fas fa-chevron-left" />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((p, i) => (
            <button
              key={i}
              className={`rv-page-btn ${p === currentPage ? 'active' : ''} ${p === '...' ? 'dots' : ''}`}
              disabled={p === '...'}
              onClick={() => p !== '...' && onPageChange(p)}
            >
              {p}
            </button>
          ))}

          {/* Next */}
          <button
            className="rv-page-btn"
            disabled={currentPage === pages}
            onClick={() => onPageChange(currentPage + 1)}
            title="Page suivante"
          >
            <i className="fas fa-chevron-right" />
          </button>

          {/* Last page */}
          <button
            className="rv-page-btn"
            disabled={currentPage === pages}
            onClick={() => onPageChange(pages)}
            title="Dernière page"
          >
            <i className="fas fa-angles-right" />
          </button>
        </div>
      )}
    </div>
  )
}
