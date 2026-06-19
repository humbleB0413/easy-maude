/**
 * @file SearchInput.jsx
 * @description
 *   Main search input with tag:value autocomplete.
 *   Autocomplete triggers when typing a word that matches a known tag prefix.
 *   Selecting a tag inserts "tag:" at the cursor. Click outside closes dropdown.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import AutoComplete from './AutoComplete.jsx';

/**
 * @param {{ onSubmit: function(string): void, disabled?: boolean }} props
 */
export default function SearchInput({ onSubmit, disabled }) {
  const [value, setValue]       = useState('');
  const [acPrefix, setAcPrefix] = useState('');
  const inputRef                = useRef(null);
  const containerRef            = useRef(null);

  // Close autocomplete on click outside the container
  useEffect(() => {
    if (!acPrefix) return;
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setAcPrefix('');
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [acPrefix]);

  const getCurrentWord = (text, cursor) => {
    const before = text.slice(0, cursor);
    const words  = before.split(/[\s|]/);
    return words[words.length - 1] ?? '';
  };

  const handleChange = useCallback((e) => {
    const text   = e.target.value;
    const cursor = e.target.selectionStart;
    setValue(text);
    const word = getCurrentWord(text, cursor);
    setAcPrefix(word.length > 0 && !word.includes(':') ? word : '');
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setAcPrefix('');
      handleSubmit();
    }
    if (e.key === 'Escape') setAcPrefix('');
  };

  const handleTagSelect = (tag) => {
    const cursor = inputRef.current.selectionStart;
    const before = value.slice(0, cursor);
    const after  = value.slice(cursor);

    // Split before-cursor text on spaces/pipes (keeping delimiters with the preceding word)
    const parts = before.split(/(?<=[\s|])/);
    parts[parts.length - 1] = `${tag}:`;
    const newValue = parts.join('') + after;
    setValue(newValue);
    setAcPrefix('');

    inputRef.current.focus();
    const newCursor = parts.join('').length;
    setTimeout(() => inputRef.current.setSelectionRange(newCursor, newCursor), 0);
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', gap: 'var(--sp)', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="e.g. brand:dexcom event:Malfunction date:20240101-20241231"
          disabled={disabled}
          aria-label="Search query"
          aria-autocomplete="list"
          aria-expanded={!!acPrefix}
          style={{ width: '100%', fontSize: 'var(--font-size-base)' }}
        />
        {acPrefix && (
          <AutoComplete
            prefix={acPrefix}
            onSelect={handleTagSelect}
            onClose={() => setAcPrefix('')}
          />
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="btn-primary"
        style={{ height: 40, whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        Search
      </button>
    </div>
  );
}
