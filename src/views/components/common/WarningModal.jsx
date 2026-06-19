/**
 * @file WarningModal.jsx
 * @description
 *   Centered overlay dialog shown when no valid OpenFDA API key is found on app init.
 *   Single confirm button dismisses and resumes.
 */

const OVERLAY = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const MODAL = {
  background: 'var(--color-white)',
  borderRadius: 8,
  width: 480,
  padding: 'calc(var(--sp) * 4)',
  boxShadow: 'var(--shadow-modal)',
};

/**
 * @param {{ onDismiss: function }} props
 */
export default function WarningModal({ onDismiss }) {
  return (
    <div style={OVERLAY} role="dialog" aria-modal="true" aria-labelledby="warning-title">
      <div style={MODAL}>
        <h2 id="warning-title" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 600, marginBottom: 'calc(var(--sp) * 2)', color: 'var(--color-text)' }}>
          API Key Not Configured
        </h2>
        <p style={{ color: 'var(--color-text)', marginBottom: 'var(--sp)', lineHeight: 1.6 }}>
          No valid API key registered. Search may take significantly longer due to rate limits.
        </p>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'calc(var(--sp) * 3)' }}>
          You can add your free API key in{' '}
          <strong>Settings</strong> (⚙). Get one at{' '}
          <a href="https://open.fda.gov/apis/authentication/" target="_blank" rel="noopener noreferrer">
            open.fda.gov/apis/authentication/
          </a>
        </p>
        <button className="btn-primary" onClick={onDismiss} style={{ width: '100%' }}>
          Continue without API key
        </button>
      </div>
    </div>
  );
}
