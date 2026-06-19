/**
 * @file HistoryPage.jsx
 * @description
 *   Standalone search history page. Accessible via Settings → Advanced → Search History.
 *   Each entry stores both metadata (search_history) and full results (search_results) in IndexedDB.
 *   Deleting an entry removes BOTH stores. Clicking an entry reloads results to ResultPage.
 */

import { useState, useEffect, useCallback } from 'react';
import historyModel from '../../models/HistoryModel.js';
import resultModel from '../../models/ResultModel.js';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorInline from '../components/common/ErrorInline.jsx';
import { useApp } from '../../context/AppContext.jsx';

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

const TH = ({ children, style }) => (
  <th style={{
    background: 'var(--color-primary)',
    color: '#fff',
    padding: '10px 16px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: 'var(--font-size-sm)',
    whiteSpace: 'nowrap',
    ...style,
  }}>
    {children}
  </th>
);

export default function HistoryPage() {
  const [entries, setEntries]   = useState([]);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [openingId, setOpeningId] = useState(null);
  const { navigate, dispatch, startSearch } = useApp();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await historyModel.getAll();
      setEntries(all);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleOpen = async (entry) => {
    setOpeningId(entry.searchId);
    try {
      const record = await resultModel.load(entry.searchId);
      if (record?.results?.length) {
        // Cached results available — restore directly
        dispatch({ type: 'SEARCH_COMPLETE', results: record.results, searchId: entry.searchId, query: entry.query });
        navigate('result');
      } else {
        // Results were too large to cache, or have been cleared — re-run search
        startSearch(entry.query);
      }
    } finally {
      setOpeningId(null);
    }
  };

  const handleDelete = async (e, searchId) => {
    e.stopPropagation();
    // historyModel.delete removes both search_history and search_results entries from IndexedDB
    await historyModel.delete(searchId);
    setEntries(prev => prev.filter(en => en.searchId !== searchId));
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all history and stored results? This cannot be undone.')) return;
    await historyModel.clearAll();
    setEntries([]);
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'calc(var(--sp) * 3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--sp) * 2)' }}>
          <button
            onClick={() => navigate('search')}
            className="btn-secondary"
            style={{ padding: '6px 14px' }}
          >
            ← Back
          </button>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 600 }}>Search History</h2>
        </div>
        {entries.length > 0 && (
          <button className="btn-danger" onClick={handleClearAll} style={{ padding: '6px 14px' }}>
            Clear All
          </button>
        )}
      </div>

      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'calc(var(--sp) * 2)' }}>
        Clicking a row loads the stored results. Deleting removes the entry and all associated result data from local storage.
      </p>

      {loading && <p style={{ color: 'var(--color-muted)', padding: 'calc(var(--sp) * 4)' }}>Loading…</p>}
      {error   && <ErrorInline message={error} onRetry={load} />}

      {!loading && !error && entries.length === 0 && (
        <EmptyState message="No search history yet" suggestion="Run a search to see it here." />
      )}

      {!loading && !error && entries.length > 0 && (
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <TH>Search Date</TH>
                <TH>Query</TH>
                <TH style={{ width: 100, textAlign: 'right' }}>Records</TH>
                <TH style={{ width: 90,  textAlign: 'right' }}>Size</TH>
                <TH style={{ width: 150 }}>Expires</TH>
                <TH style={{ width: 80  }}></TH>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => {
                const isOpening = openingId === entry.searchId;
                return (
                  <tr
                    key={entry.searchId}
                    onClick={() => !isOpening && handleOpen(entry)}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      cursor: isOpening ? 'wait' : 'pointer',
                      opacity: isOpening ? 0.6 : 1,
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isOpening) e.currentTarget.style.background = 'var(--color-row-hover)'; }}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && !isOpening && handleOpen(entry)}
                    aria-label={`Load search: ${entry.query}`}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(entry.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: 0, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--color-accent)', fontWeight: 500 }}>{entry.query}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {entry.totalCount?.toLocaleString() ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                      {formatBytes(entry.dataSize)}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                      {formatDate(entry.expiresAt)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={e => handleDelete(e, entry.searchId)}
                        className="btn-danger"
                        style={{ padding: '4px 10px', fontSize: 'var(--font-size-sm)' }}
                        aria-label="Delete this history entry"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
