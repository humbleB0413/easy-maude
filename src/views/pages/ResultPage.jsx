/**
 * @file ResultPage.jsx
 * @description
 *   Search results page. Shows total count, Excel export button, and ResultTable.
 */

import ResultTable from '../components/Results/ResultTable.jsx';
import AdSlot from '../components/common/AdSlot.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { exportToExcel } from '../../utils/excelExport.js';
import { ADSENSE } from '../../constants/config.js';
import { useState } from 'react';

export default function ResultPage() {
  const { state, navigate } = useApp();
  const { results, searchQuery } = state;
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const filename = `maude_${Date.now()}`;
      exportToExcel(results, filename);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'calc(var(--sp) * 3)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 600 }}>Search Results</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
            <strong style={{ color: 'var(--color-text)' }}>{results.length.toLocaleString()}</strong> records — <span style={{ fontStyle: 'italic' }}>{searchQuery}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp)' }}>
          <button className="btn-secondary" onClick={() => navigate('search')}>New Search</button>
          <button
            className="btn-primary"
            onClick={handleExport}
            disabled={exporting || results.length === 0}
          >
            {exporting ? 'Exporting…' : 'Export Excel'}
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <ResultTable results={results} />
      </div>

      <AdSlot slot={ADSENSE.SLOTS.RESULT_BANNER} style={{ marginTop: 'calc(var(--sp) * 4)' }} />
    </div>
  );
}
