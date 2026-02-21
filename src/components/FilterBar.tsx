import React from 'react';
import { Group, Idol, Tag } from '@/types';

interface FilterBarProps {
  groups: Group[];
  idols: Idol[];
  tags: Tag[];
  groupId?: number;
  idolId?: number;
  tagId?: number;
  onGroupChange: (id?: number) => void;
  onIdolChange: (id?: number) => void;
  onTagChange: (id?: number) => void;
  onReset: () => void;
}

export default function FilterBar({
  groups, idols, tags,
  groupId, idolId, tagId,
  onGroupChange, onIdolChange, onTagChange, onReset
}: FilterBarProps) {
  const hasFilter = groupId || idolId || tagId;
  const selectStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)', background: 'var(--surface)',
    fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', outline: 'none',
  };
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <select style={selectStyle} value={groupId || ''} onChange={e => onGroupChange(e.target.value ? Number(e.target.value) : undefined)}>
        <option value="">All Groups</option>
        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <select style={selectStyle} value={idolId || ''} onChange={e => onIdolChange(e.target.value ? Number(e.target.value) : undefined)}>
        <option value="">All Idols</option>
        {idols.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
      </select>
      <select style={selectStyle} value={tagId || ''} onChange={e => onTagChange(e.target.value ? Number(e.target.value) : undefined)}>
        <option value="">All Tags</option>
        {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      {hasFilter && (
        <button className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: 12 }} onClick={onReset}>
          Clear filters
        </button>
      )}
    </div>
  );
}
