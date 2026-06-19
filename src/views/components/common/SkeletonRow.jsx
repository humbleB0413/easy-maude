/**
 * @file SkeletonRow.jsx
 * @description
 *   Animated skeleton placeholder row matching ResultRow column layout.
 *   Used during loading state in ResultTable.
 */

const cell = (width) => (
  <td style={{ padding: '14px 16px' }}>
    <div className="skeleton" style={{ height: 14, width }} />
  </td>
);

export default function SkeletonRow() {
  return (
    <tr aria-hidden="true">
      {cell(32)}
      {cell('50%')}
      {cell(110)}
      {cell(90)}
      {cell(80)}
    </tr>
  );
}
