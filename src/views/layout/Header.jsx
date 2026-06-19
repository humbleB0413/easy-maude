/**
 * @file Header.jsx
 * @description
 *   Top navigation bar. Shows app name only.
 *   Settings icon is in the bottom-left corner (see AppLayout).
 */

export default function Header() {
  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--color-primary)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 calc(var(--sp) * 3)',
      flexShrink: 0,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--sp) * 1.5)' }}>
        <a
          href="/"
          style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 'var(--font-size-h3)',
            letterSpacing: '0.02em',
            textDecoration: 'none',
            cursor: 'default',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#fff')}
          onMouseLeave={(e) => (e.target.style.color = '#fff')}
        >
          <img
          src="icon.png"
          alt="Easy MAUDE logo"
          style={{ width: 45, height: 45, objectFit: 'contain', mixBlendMode: 'screen' }}
        />
        </a>
        <a
          href="/"
          style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 'var(--font-size-h3)',
            letterSpacing: '0.02em',
            textDecoration: 'none',
            cursor: 'default',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#fff')}
          onMouseLeave={(e) => (e.target.style.color = '#fff')}
        >
          Easy MAUDE
        </a>
      </span>
    </header>
  );
}
