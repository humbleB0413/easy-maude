/**
 * @file Breadcrumb.jsx
 * @description
 *   Navigation breadcrumb: Search Results > Report Detail.
 *   First item is a clickable link to navigate back.
 */

/**
 * @param {{ items: Array<{ label: string, onClick?: function }> }} props
 */
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp)', marginBottom: 'calc(var(--sp) * 3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp)' }}>
          {i > 0 && <span aria-hidden="true">›</span>}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: 'var(--color-accent)', cursor: 'pointer', fontSize: 'inherit',
              }}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
