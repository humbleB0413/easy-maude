/**
 * @file ResultRow.jsx
 * @description
 *   Single row in the results table. Clickable — navigates to DetailPage.
 *   Columns: No., Brand Name + Generic, MDR Report Key, Date Received, Event Type.
 */

import { useApp } from '../../../context/AppContext.jsx';

const TD = ({ children, style }) => (
  <td style={{ padding: '14px 16px', verticalAlign: 'middle', ...style }}>{children}</td>
);

/**
 * @param {{ record: object, index: number }} props
 */
export default function ResultRow({ record, index }) {
  const { navigate } = useApp();
  const device = record.device?.[0] ?? {};

  return (
    <tr
      onClick={() => navigate('detail', { record })}
      style={{ cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-row-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate('detail', { record })}
    >
      <TD style={{ color: 'var(--color-muted)', width: 56, textAlign: 'right' }}>{index + 1}</TD>
      <TD>
        <div style={{ fontWeight: 500 }}>{device.brand_name || '—'}</div>
        {device.generic_name && (
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginTop: 2 }}>
            {device.generic_name}
          </div>
        )}
      </TD>
      <TD style={{ width: 150, fontFamily: 'monospace', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
        {record.mdr_report_key || '—'}
      </TD>
      <TD style={{ color: 'var(--color-muted)', width: 130 }}>{record.date_received || '—'}</TD>
      <TD style={{ width: 140 }}>
        <span style={{
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: 12,
          fontSize: 'var(--font-size-sm)',
          background: 'var(--color-row-hover)',
          color: 'var(--color-accent)',
          fontWeight: 500,
        }}>
          {record.event_type || '—'}
        </span>
      </TD>
    </tr>
  );
}
