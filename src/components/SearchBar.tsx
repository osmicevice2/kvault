import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
      <input
        className="input"
        style={{ paddingLeft: 38 }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
