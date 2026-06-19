/**
 * @file EmptyState.jsx
 * @description
 *   Centered empty state UI: icon, message, optional suggestion text.
 */

/**
 * @param {{ message?: string, suggestion?: string }} props
 */
export default function EmptyState({ message = 'No results found', suggestion }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'calc(var(--sp) * 8)',
      color: 'var(--color-muted)',
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 'calc(var(--sp) * 2)', opacity: 0.4 }} aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
      <p style={{ fontWeight: 600, marginBottom: suggestion ? 'var(--sp)' : 0 }}>{message}</p>
      {suggestion && <p style={{ fontSize: 'var(--font-size-sm)' }}>{suggestion}</p>}
    </div>
  );
}
