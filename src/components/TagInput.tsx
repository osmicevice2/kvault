import React, { useState, useRef } from 'react';
import { Tag } from '@/types';

interface TagInputProps {
  selected: string[];
  onChange: (tags: string[]) => void;
  suggestions?: Tag[];
}

export default function TagInput({ selected, onChange, suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = suggestions.filter(t =>
    t.name.toLowerCase().includes(input.toLowerCase()) && !selected.includes(t.name)
  );

  function addTag(name: string) {
    const trimmed = name.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  }

  function removeTag(name: string) {
    onChange(selected.filter(t => t !== name));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) addTag(input);
    } else if (e.key === 'Backspace' && !input && selected.length > 0) {
      removeTag(selected[selected.length - 1]);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          background: 'var(--surface)', cursor: 'text', minHeight: 42,
          alignItems: 'center',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map(tag => (
          <span key={tag} className="tag-badge" style={{ gap: 4 }}>
            {tag}
            <button
              onClick={() => removeTag(tag)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary)', fontSize: 12, lineHeight: 1 }}
            >×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, minWidth: 80, flex: 1 }}
          placeholder={selected.length === 0 ? 'Add tags...' : ''}
        />
      </div>
      {showSuggestions && (input || filtered.length > 0) && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)', maxHeight: 180, overflow: 'auto', marginTop: 4,
        }}>
          {input.trim() && !suggestions.find(t => t.name === input.trim()) && (
            <div
              onMouseDown={() => addTag(input)}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--primary)', borderBottom: '1px solid var(--border)' }}
            >
              Create tag &quot;{input.trim()}&quot;
            </div>
          )}
          {filtered.map(t => (
            <div
              key={t.id}
              onMouseDown={() => addTag(t.name)}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}
            >
              {t.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
