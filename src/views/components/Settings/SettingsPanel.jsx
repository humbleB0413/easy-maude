/**
 * @file SettingsPanel.jsx
 * @description
 *   Slide-in settings panel.
 *   Sections: API Configuration, Search Settings, Appearance, Advanced.
 *   Advanced contains: View History (→ history page).
 */

import { useEffect } from 'react';
import SettingsController from '../../../controllers/SettingsController.js';
import { useApp } from '../../../context/AppContext.jsx';

const SORT_OPTIONS  = [
  { value: 'date_received:desc', label: 'Date Received (newest)' },
  { value: 'date_received:asc',  label: 'Date Received (oldest)' },
];

/**
 * @param {{ open: boolean, onClose: function, settings: object, onSettingsChange: function,
 *           theme: string, onThemeToggle: function }} props
 */
export default function SettingsPanel({ open, onClose, settings, onSettingsChange, theme, onThemeToggle }) {
  const { navigate } = useApp();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleViewHistory = () => {
    navigate('history');
    onClose();
  };


  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }}
          aria-hidden="true"
        />
      )}
      <aside
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 'var(--panel-width)',
          height: '100vh',
          background: 'var(--color-white)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 250ms ease',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
        aria-label="Settings panel"
        aria-hidden={!open}
      >
        {/* Header */}
        <div style={{ padding: 'calc(var(--sp) * 3)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 600 }}>Settings</h2>
          <button onClick={onClose} aria-label="Close settings" style={{ background: 'none', color: 'var(--color-muted)', padding: 'var(--sp)', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 'calc(var(--sp) * 3)', flex: 1 }}>

          <Section title="API Configuration">
            <Field label="OpenFDA API Key">
              <input
                type="password"
                value={settings.apiKey}
                onChange={e => SettingsController.handleApiKeyChange(e.target.value, onSettingsChange)}
                placeholder="Enter your API key"
                aria-label="OpenFDA API key"
              />
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginTop: 4 }}>
                Get a free key at{' '}
                <a href="https://open.fda.gov/apis/authentication/" target="_blank" rel="noopener noreferrer">open.fda.gov </a>
                (Highly Recommended)
              </p>
            </Field>
          </Section>

          <Section title="Search Settings">
            <Field label="Default Sort">
              <select value={settings.defaultSort} onChange={e => SettingsController.handleSortChange(e.target.value, onSettingsChange)} aria-label="Default sort order">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="Appearance">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </span>
              <button
                onClick={onThemeToggle}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                style={{
                  width: 48, height: 26,
                  borderRadius: 13,
                  background: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-border)',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.25s',
                  padding: 0,
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: 3, left: theme === 'dark' ? 25 : 3,
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.25s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          </Section>

          <Section title="Advanced" subtitle="For advanced users">
            <div style={{ marginBottom: 'calc(var(--sp) * 2)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'var(--sp)' }}>
                View past searches and their stored results.
              </p>
              <button
                onClick={handleViewHistory}
                className="btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>Search History</span>
                <span style={{ color: 'var(--color-accent)' }}>→</span>
              </button>
            </div>

          </Section>

        </div>
      </aside>
    </>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 'calc(var(--sp) * 4)' }}>
      <div style={{ marginBottom: 'calc(var(--sp) * 2)' }}>
        <h3 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 600 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 'calc(var(--sp) * 2)' }}>
      <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 6, color: 'var(--color-text)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
