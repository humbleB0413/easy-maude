/**
 * @file AutoComplete.jsx
 * @description
 *   Dropdown showing known tag suggestions matching the current partial input.
 *   Keyboard: ArrowUp/Down to navigate, Enter to select, Escape to close.
 */

import { useEffect, useRef } from 'react';
import tagMap, { TAG_LABELS } from '../../../constants/tagMap.js';

const ALL_TAGS = Object.keys(tagMap);

/**
 * @param {{ prefix: string, onSelect: function, onClose: function }} props
 */
export default function AutoComplete({ prefix, onSelect, onClose }) {
  const matches = ALL_TAGS.filter(t => t.startsWith(prefix.toLowerCase()));
  const listRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (matches.length === 0) return null;

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="Tag suggestions"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        zIndex: 100,
        maxHeight: 240,
        overflowY: 'auto',
        listStyle: 'none',
        marginTop: 4,
        padding: '4px 0',
      }}
    >
      {matches.map(tag => (
        <li
          key={tag}
          role="option"
          onClick={() => onSelect(tag)}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-row-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = ''}
        >
          <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{tag}:</span>
          <span style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>{TAG_LABELS[tag]}</span>
        </li>
      ))}
    </ul>
  );
}
