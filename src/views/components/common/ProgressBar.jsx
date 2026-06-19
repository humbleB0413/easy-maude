/**
 * @file ProgressBar.jsx
 * @description
 *   Horizontal progress bar with percentage text below.
 *   Props: received, total (numbers).
 */

/**
 * @param {{ received: number, total: number }} props
 */
export default function ProgressBar({ received, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 0;

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        height: 8,
        borderRadius: 4,
        background: 'var(--color-border)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--color-accent)',
          borderRadius: 4,
          transition: 'width 0.3s ease',
        }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} />
      </div>
      <p style={{ marginTop: 'var(--sp)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', textAlign: 'center' }}>
        {received.toLocaleString()} / {total > 0 ? total.toLocaleString() : '…'} ({pct}%)
      </p>
    </div>
  );
}
