/**
 * @file App.jsx
 * @description
 *   Root component. Loads settings and theme from storage on mount,
 *   validates API key, provides AppContext to the component tree.
 */

import { useState, useEffect } from 'react';
import './App.css';
import { AppProvider } from './context/AppContext.jsx';
import AppLayout from './views/layout/AppLayout.jsx';
import settingsModel from './models/SettingsModel.js';
import ApiKeyValidator from './controllers/ApiKeyValidator.js';

function getInitialTheme() {
  const saved = localStorage.getItem('easy_maude_theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [settings, setSettings] = useState(() => {
    settingsModel.loadFromCookie();
    return settingsModel.toSnapshot();
  });
  const [showWarning, setShowWarning] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('easy_maude_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!ApiKeyValidator.validate(settings.apiKey)) {
      setShowWarning(true);
    }
  }, []);

  const handleSettingsChange = (updated) => {
    setSettings(prev => ({ ...prev, ...updated }));
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <AppProvider settings={settings}>
      <AppLayout
        settings={settings}
        onSettingsChange={handleSettingsChange}
        showWarning={showWarning}
        onDismissWarning={() => setShowWarning(false)}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
    </AppProvider>
  );
}
