/**
 * @file ProgressPage.jsx
 * @description
 *   Search in-progress screen. Shows query, progress bar, received/total counts, and Cancel.
 *   Reads live progress from AppContext state (updated by SearchController callbacks).
 *   After 15 s, shows a rotating idle message to keep long searches friendly.
 */

import { useState, useEffect, useRef } from 'react';
import ProgressBar from '../components/common/ProgressBar.jsx';
import ErrorInline from '../components/common/ErrorInline.jsx';
import AdSlot from '../components/common/AdSlot.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { ADSENSE } from '../../constants/config.js';

const IDLE_MESSAGES = [
  'How about a quick coffee break? ☕',
  'Lots of data incoming — a glass of water might be just what you need. 💧',
  'Still crunching numbers. A good time to stretch! 🙆',
  'This one\'s a big haul. Feel free to rest your eyes for a moment. 😌',
  'While you wait, why not listen to your favorite song? 🎵',
  'Take a peek outside — the results will be here when you get back. 🌤️',
  'Hard at work fetching data. A snack break sounds reasonable right now. 🍪',
  'Still going! A short walk might do you good. 🚶',
  'Pulling in records — a great excuse to check your inbox. 📬',
  'Good things take time. Why not do a quick eye exercise? 👀',
  'The FDA database is vast. Your patience is appreciated! 🗂️',
  'Tip: the more specific your query, the faster the results. 💡',
  'Rome wasn\'t built in a day, and neither is a big dataset. 🏛️',
  'This might be a good moment to refill your coffee. Just saying. ☕',
  'Deep breaths — the data is on its way. 🧘',
  'Why not jot down what you\'re looking for? It helps when reviewing the results. 📝',
  'Still here, still fetching. You\'re doing great just by waiting. 🌟',
  'Fun fact: the FDA MAUDE database holds millions of device event records. Worth the wait! 📊',
  'Consider this a built-in mindfulness break. 🌿',
  'Your query is being taken very seriously by our servers. 🖥️',
  'Lean back, take a breath — the results won\'t run away. 🛋️',
  'If you had a plant nearby, now\'s a perfect time to water it. 🪴',
  'Large date ranges mean more records. More records mean more waiting. You nailed it. 📅',
  'The internet is working hard for you right now. Give it a moment. 🌐',
  'Go ahead and check on that other tab. We\'ll hold things down here. 🔖',
  'Think of this as express shipping — just with a longer estimate. 📦',
  'Still running! Maybe now\'s the time to finally reply to that message. 💬',
  'Patience is a virtue — and so is a well-executed MAUDE search. 🏅',
  'Your results are being assembled with care. Good things ahead. ✨',
  'Take five. Seriously, we\'ve got this. 🤝',
  'Why not do a quick shoulder roll? Your neck will thank you. 🔄',
  'Almost certainly still fetching. Possibly just vibing. Hard to say. 🤷',
];

const SHOW_AFTER_MS  = 60_000;
const CYCLE_EVERY_MS = 30_000;

function pickRandom(exclude) {
  const pool = exclude ? IDLE_MESSAGES.filter(m => m !== exclude) : IDLE_MESSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function ProgressPage() {
  const { state, cancelSearch, startSearch } = useApp();
  const { progress, searchQuery, searchStatus, error } = state;
  const { received, total, windowReceived, windowTotal, windowDateRange } = progress;
  const isSplitting = windowDateRange != null;

  const [idleMsg, setIdleMsg] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIdleMsg(pickRandom(null));
      intervalRef.current = setInterval(
        () => setIdleMsg(prev => pickRandom(prev)),
        CYCLE_EVERY_MS,
      );
    }, SHOW_AFTER_MS);

    return () => {
      clearTimeout(timeout);
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 'calc(var(--sp) * 10)', textAlign: 'center' }}>
      <div style={{ marginBottom: 'calc(var(--sp) * 3)' }}>
        <Spinner />
      </div>

      <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 600, marginBottom: 'var(--sp)' }}>
        Searching…
      </h2>
      <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'calc(var(--sp) * 4)', wordBreak: 'break-all' }}>
        {searchQuery}
      </p>

      {isSplitting ? (
        <>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'var(--sp)' }}>
            Period: <strong style={{ color: 'var(--color-text)' }}>{windowDateRange}</strong>
          </p>
          <ProgressBar received={windowReceived} total={windowTotal} />
        </>
      ) : (
        <ProgressBar received={received} total={total} />
      )}

      {searchStatus === 'error' && error && (
        <div style={{ marginTop: 'calc(var(--sp) * 3)' }}>
          <ErrorInline message={error} onRetry={() => startSearch(searchQuery)} />
        </div>
      )}

      <div style={{ marginTop: 'calc(var(--sp) * 4)' }}>
        <button onClick={cancelSearch} className="btn-secondary">Cancel</button>
      </div>

      {idleMsg && (
        <p style={{
          marginTop: 'calc(var(--sp) * 5)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-muted)',
          fontStyle: 'italic',
          animation: 'fadeIn 0.6s ease',
        }}>
          {idleMsg}
        </p>
      )}

      <AdSlot slot={ADSENSE.SLOTS.PROGRESS_BANNER} style={{ marginTop: 'calc(var(--sp) * 5)' }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 48, height: 48,
      border: '4px solid var(--color-border)',
      borderTopColor: 'var(--color-accent)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto',
    }} aria-hidden="true" />
  );
}
