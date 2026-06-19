/**
 * @file ServiceUnavailablePage.jsx
 * @description
 *   Shown when the OpenFDA API is unreachable (network failure or 5xx response).
 *   Provides retry (re-run last query) and new search actions.
 */

import { useApp } from '../../context/AppContext.jsx';

export default function ServiceUnavailablePage() {
  const { state, navigate, startSearch } = useApp();
  const { searchQuery } = state;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', paddingTop: 'calc(var(--sp) * 12)', textAlign: 'center' }}>

      <CloudOffIcon />

      <h2 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 700, color: 'var(--color-primary)', marginTop: 'calc(var(--sp) * 3)', marginBottom: 'var(--sp)' }}>
        OpenFDA Temporarily Unavailable
      </h2>

      <p style={{ color: 'var(--color-text)', lineHeight: 1.7, marginBottom: 'calc(var(--sp) * 1.5)' }}>
        The FDA MAUDE database is not responding at the moment.
        This is a temporary issue on the FDA's end — not a problem with this app.
      </p>
      <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'calc(var(--sp) * 5)' }}>
        Please wait a moment and try again.
      </p>

      <div style={{ display: 'flex', gap: 'calc(var(--sp) * 2)', justifyContent: 'center' }}>
        {searchQuery && (
          <button
            className="btn-primary"
            onClick={() => startSearch(searchQuery)}
          >
            Try Again
          </button>
        )}
        <button
          className="btn-secondary"
          onClick={() => navigate('search')}
        >
          New Search
        </button>
      </div>

      <p style={{ marginTop: 'calc(var(--sp) * 6)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
        You can check the FDA API status at{' '}
        <a
          href="https://open.fda.gov"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-accent)' }}
        >
          open.fda.gov
        </a>
      </p>

    </div>
  );
}

function CloudOffIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-muted)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ margin: '0 auto', display: 'block' }}
      aria-hidden="true"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 0 1 3 7.88" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
