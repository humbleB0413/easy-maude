/**
 * @file ErrorInline.jsx
 * @description
 *   Inline error message displayed below affected components.
 *   Optional retry button triggers onRetry callback.
 */

/**
 * @param {{ message: string, onRetry?: function }} props
 */
export default function ErrorInline({ message, onRetry }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'calc(var(--sp) * 1.5)',
      color: 'var(--color-error)',
      fontSize: 'var(--font-size-sm)',
      padding: 'var(--sp) 0',
    }} role="alert">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary"
          style={{ fontSize: 'var(--font-size-sm)', padding: '4px 12px', marginLeft: 'var(--sp)' }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
