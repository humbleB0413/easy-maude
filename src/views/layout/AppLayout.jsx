/**
 * @file AppLayout.jsx
 * @description
 *   Root layout wrapper. Fixed bottom-left settings button. Site footer with nav links.
 *   Pages: search, progress, result, detail, history, unavailable.
 */

import Header from './Header.jsx';
import SettingsPanel from '../components/Settings/SettingsPanel.jsx';
import WarningModal from '../components/common/WarningModal.jsx';
import SearchPage from '../pages/SearchPage.jsx';
import ProgressPage from '../pages/ProgressPage.jsx';
import ResultPage from '../pages/ResultPage.jsx';
import DetailPage from '../pages/DetailPage.jsx';
import HistoryPage from '../pages/HistoryPage.jsx';
import ServiceUnavailablePage from '../pages/ServiceUnavailablePage.jsx';
import { useApp } from '../../context/AppContext.jsx';

const PAGES = {
  search:      SearchPage,
  progress:    ProgressPage,
  result:      ResultPage,
  detail:      DetailPage,
  history:     HistoryPage,
  unavailable: ServiceUnavailablePage,
};

const SettingsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/**
 * @param {{ settings: object, onSettingsChange: function, showWarning: boolean,
 *           onDismissWarning: function, theme: string, onThemeToggle: function }} props
 */
export default function AppLayout({ settings, onSettingsChange, showWarning, onDismissWarning, theme, onThemeToggle }) {
  const { state, dispatch } = useApp();
  const PageComponent = PAGES[state.currentPage] ?? SearchPage;

  return (
    <div className="app-root">
      <Header />

      <main style={{ flex: 1, padding: 'calc(var(--sp) * 3)', maxWidth: 'var(--content-max-width)', width: '100%', margin: '0 auto' }}>
        <PageComponent params={state.pageParams} />
      </main>

      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: 'calc(var(--sp) * 2) calc(var(--sp) * 3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'calc(var(--sp) * 3)',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-muted)',
        flexShrink: 0,
      }}>
        <a href="/guide.html" style={{ color: 'var(--color-muted)' }}
          onMouseEnter={e => e.target.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.target.style.color = 'var(--color-muted)'}
        >Search Guide</a>
        <a href="/about.html" style={{ color: 'var(--color-muted)' }}
          onMouseEnter={e => e.target.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.target.style.color = 'var(--color-muted)'}
        >About</a>
        <a href="/privacy.html" style={{ color: 'var(--color-muted)' }}
          onMouseEnter={e => e.target.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.target.style.color = 'var(--color-muted)'}
        >Privacy Policy</a>
        <span>·</span>
        <span>Data: <a href="https://open.fda.gov/" target="_blank" rel="noopener" style={{ color: 'var(--color-muted)' }}
          onMouseEnter={e => e.target.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.target.style.color = 'var(--color-muted)'}
        >OpenFDA</a></span>
      </footer>

      {/* Fixed settings button — bottom-left */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        aria-label="Open settings"
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--color-primary)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          zIndex: 100,
          padding: 0,
          border: 'none',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = ''}
      >
        <SettingsIcon />
      </button>

      <SettingsPanel
        open={state.showSettings}
        onClose={() => dispatch({ type: 'CLOSE_SETTINGS' })}
        settings={settings}
        onSettingsChange={onSettingsChange}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />

      {showWarning && <WarningModal onDismiss={onDismissWarning} />}
    </div>
  );
}
