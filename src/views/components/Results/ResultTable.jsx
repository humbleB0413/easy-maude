/**
 * @file ResultTable.jsx
 * @description
 *   Results table with client-side pagination and skeleton loading state.
 *   Columns: No., Brand Name (+ Generic), MDR Report Key, Date Received, Event Type.
 */

import { useState } from 'react';
import ResultRow from './ResultRow.jsx';
import Pagination from './Pagination.jsx';
import SkeletonRow from '../common/SkeletonRow.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { PAGINATION } from '../../../constants/config.js';

const TH = ({ children, style }) => (
  <th style={{
    background: 'var(--color-primary)',
    color: '#fff',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: 'var(--font-size-sm)',
    letterSpacing: '0.04em',
    ...style,
  }}>
    {children}
  </th>
);

/**
 * @param {{ results: Array, loading?: boolean }} props
 */
export default function ResultTable({ results, loading }) {
  const [page, setPage] = useState(1);
  const pageSize   = PAGINATION.PAGE_SIZE;
  const totalPages = Math.ceil(results.length / pageSize);
  const slice      = results.slice((page - 1) * pageSize, page * pageSize);

  if (!loading && results.length === 0) {
    return <EmptyState message="No records found" suggestion="Try different search terms or broaden the date range." />;
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <TH style={{ width: 56, textAlign: 'right' }}>#</TH>
              <TH>Brand Name / Generic Name</TH>
              <TH style={{ width: 150 }}>MDR Report Key</TH>
              <TH style={{ width: 130 }}>Date Received</TH>
              <TH style={{ width: 140 }}>Event Type</TH>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} />)
              : slice.map((r, i) => (
                  <ResultRow key={r.mdr_report_key ?? i} record={r} index={(page - 1) * pageSize + i} />
                ))
            }
          </tbody>
        </table>
      </div>
      {!loading && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  );
}
