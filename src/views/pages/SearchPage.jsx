/**
 * @file SearchPage.jsx
 * @description
 *   Main search UI. Shows the search input and tag syntax guide.
 *   Submitting triggers SearchController via AppContext.startSearch().
 */

import { useState } from 'react';
import SearchInput from '../components/SearchInput/SearchInput.jsx';
import AdSlot from '../components/common/AdSlot.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { ADSENSE } from '../../constants/config.js';

export default function SearchPage() {
  const { startSearch, state } = useApp();
  const isSearching = state.searchStatus === 'searching';
  const [tagsOpen, setTagsOpen] = useState(false);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingTop: 'calc(var(--sp) * 6)' }}>
      <h1 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 700, marginBottom: 'var(--sp)', color: 'var(--color-primary)' }}>
        MAUDE Device Event Search
      </h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: 'calc(var(--sp) * 4)' }}>
        Search FDA Medical Device Adverse Event reports using tag:value syntax.
      </p>

      <SearchInput onSubmit={startSearch} disabled={isSearching} />

      <p style={{ marginTop: 'calc(var(--sp) * 1.5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
        Tip: Searches default to the <strong>last 12 months</strong>. Use <code style={{ fontFamily: 'monospace', fontSize: 11 }}>date:YYYYMMDD-YYYYMMDD</code> to specify a range, or <code style={{ fontFamily: 'monospace', fontSize: 11 }}>date:19900101-</code> for all records.
      </p>

      <p style={{ marginTop: 'calc(var(--sp) * 1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
        ⚠ Search results and history are saved <strong>only in this browser</strong> and may be lost if browser data is cleared, you use private/incognito mode, or Safari's 7-day inactivity policy applies.
      </p>

      <div style={{ marginTop: 'calc(var(--sp) * 4)', padding: 'calc(var(--sp) * 2)', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
        <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--sp)', color: 'var(--color-text)' }}>Query syntax</p>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', lineHeight: 2 }}>
          <code style={codeStyle}>code:FRN event:Malfunction</code> — AND (default)<br />
          <code style={codeStyle}>brand:dexcom | brand:abbott</code> — OR<br />
          <code style={codeStyle}>code:FRN date:20240101-20241231</code> — date range(default: 1 year from today, "date:from-"" or "date:-to", for not specifying date)<br />
          <code style={codeStyle}>manufacturer:boston scientific</code> — phrase (multi-word)
        </div>
        {/* Available tags — collapsible */}
        <button
          onClick={() => setTagsOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'var(--sp)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}
          aria-expanded={tagsOpen}
        >
          <span style={{ display: 'inline-block', transition: 'transform 200ms', transform: tagsOpen ? 'rotate(90deg)' : 'rotate(0deg)', fontSize: 10 }}>▶</span>
          Available tags
        </button>

        {tagsOpen && (
          <table style={{ marginTop: 'var(--sp)', width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ background: '#f0f4ff' }}>
                <th style={thStyle}>Tag</th>
                <th style={thStyle}>OpenFDA Field</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Example</th>
              </tr>
            </thead>
            <tbody>
              {TAG_DOCS.map(({ tag, field, desc, example }, i) => (
                <tr key={tag} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fb' }}>
                  <td style={tdStyle}><code style={codeStyle}>{tag}</code></td>
                  <td style={{ ...tdStyle, color: 'var(--color-muted)', fontFamily: 'monospace', fontSize: 11 }}>{field}</td>
                  <td style={tdStyle}>{desc}</td>
                  <td style={tdStyle}><code style={codeStyle}>{example}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdSlot slot={ADSENSE.SLOTS.SEARCH_BANNER} style={{ marginTop: 'calc(var(--sp) * 4)' }} />
    </div>
  );
}

const codeStyle = {
  fontFamily: 'monospace',
  background: '#f0f4ff',
  padding: '1px 6px',
  borderRadius: 4,
  color: 'var(--color-accent)',
};

const thStyle = {
  padding: '6px 10px',
  textAlign: 'left',
  fontWeight: 600,
  color: 'var(--color-text)',
  borderBottom: '1px solid var(--color-border)',
};

const tdStyle = {
  padding: '5px 10px',
  color: 'var(--color-text)',
  verticalAlign: 'top',
};

const TAG_DOCS = [
  { tag: 'brand',        field: 'device.brand_name',                    desc: 'Commercial brand name of the device',                                    example: 'brand:dexcom' },
  { tag: 'generic',      field: 'device.generic_name',                  desc: 'Generic or technical device name',                                       example: 'generic:catheter' },
  { tag: 'manufacturer', field: 'device.manufacturer_d_name',           desc: 'Name of the device manufacturer',                                        example: 'manufacturer:medtronic' },
  { tag: 'model',        field: 'device.model_number',                  desc: 'Device model number',                                                    example: 'model:G7' },
  { tag: 'code',         field: 'device.device_report_product_code',    desc: 'FDA 3-letter product code — automatically uppercased',                   example: 'code:FRN' },
  { tag: 'udi',          field: 'device.udi_di',                        desc: 'UDI-DI barcode identifier (Device Identifier portion of the UDI)',       example: 'udi:00380740006547' },
  { tag: 'event',        field: 'event_type',                           desc: 'Event type: Malfunction · Injury · Death · Other',                       example: 'event:Malfunction' },
  { tag: 'date',         field: 'date_received',                        desc: 'Date FDA received the report (YYYYMMDD or range). Defaults to last 1 year if omitted.', example: 'date:20240101-20241231' },
  { tag: 'event_date',   field: 'date_of_event',                        desc: 'Actual date the adverse event occurred',                                 example: 'event_date:20231015-' },
  { tag: 'report',       field: 'mdr_report_key',                       desc: 'MDR report key — unique identifier for a specific report',               example: 'report:3014449-2024' },
  { tag: 'reporter',     field: 'reporter_occupation_code',             desc: 'Reporter occupation code (P = Physician, N = Nurse, H = Hospital, etc.)', example: 'reporter:P' },
  { tag: 'text',         field: 'mdr_text.text',                        desc: 'Full-text search within event description and manufacturer narratives',   example: 'text:battery failure' },
  { tag: 'problem',      field: 'product_problems',                     desc: 'Product problem type reported (e.g. Failure to Operate, Leakage)',       example: 'problem:Leakage' },
];
