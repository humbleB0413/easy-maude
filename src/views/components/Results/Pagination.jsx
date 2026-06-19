/**
 * @file Pagination.jsx
 * @description
 *   Page navigation controls: Previous, page numbers, Next.
 */

/**
 * @param {{ page: number, totalPages: number, onChange: function(number): void }} props
 */
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageRange(page, totalPages);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp)', padding: 'calc(var(--sp) * 2) 0' }}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="btn-secondary"
        style={{ padding: '6px 12px' }}
        aria-label="Previous page"
      >
        ‹ Prev
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} style={{ color: 'var(--color-muted)', padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius)',
              border: '1px solid',
              borderColor: p === page ? 'var(--color-accent)' : 'var(--color-border)',
              background:  p === page ? 'var(--color-accent)' : 'var(--color-white)',
              color:       p === page ? '#fff'               : 'var(--color-text)',
              fontWeight:  p === page ? 600 : 400,
            }}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="btn-secondary"
        style={{ padding: '6px 12px' }}
        aria-label="Next page"
      >
        Next ›
      </button>
    </div>
  );
}

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}
