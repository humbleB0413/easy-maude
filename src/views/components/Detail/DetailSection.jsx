/**
 * @file DetailSection.jsx
 * @description
 *   Reusable labeled section block for DetailPage.
 *   Renders a title and a list of { label, value } field pairs.
 */

/**
 * @param {{ title: string, fields: Array<{ label: string, value: string|undefined }> }} props
 */
export default function DetailSection({ title, fields }) {
  const visible = fields.filter(f => f.value !== undefined && f.value !== null && f.value !== '');
  if (visible.length === 0) return null;

  return (
    <section style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius)',
      padding: 'calc(var(--sp) * 3)',
      marginBottom: 'calc(var(--sp) * 2)',
    }}>
      <h3 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 600, marginBottom: 'calc(var(--sp) * 2)', color: 'var(--color-text)' }}>
        {title}
      </h3>
      <dl style={{ display: 'grid', gridTemplateColumns: '200px 1fr', rowGap: 'calc(var(--sp) * 1.5)', columnGap: 'calc(var(--sp) * 2)' }}>
        {visible.map(f => (
          <div key={f.label} style={{ display: 'contents' }}>
            <dt style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 500, paddingTop: 2 }}>{f.label}</dt>
            <dd style={{ color: 'var(--color-text)', wordBreak: 'break-word' }}>{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
