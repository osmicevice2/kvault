import React, { useState, useRef, useCallback } from 'react';
import { Group, Idol, Tag } from '@/types';
import TagInput from './TagInput';
import { useToast } from './Toast';

interface UploadZoneProps {
  groups: Group[];
  idols: Idol[];
  tags: Tag[];
  onUploaded?: () => void;
}

export default function UploadZone({ groups, idols, tags, onUploaded }: UploadZoneProps) {
  const { showToast } = useToast();
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedIdols, setSelectedIdols] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...dropped]);
  }, []);

  async function handleUpload() {
    if (files.length === 0) { showToast('Select at least one file', 'error'); return; }
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('title', title || file.name.replace(/\.[^.]+$/, ''));
        fd.append('description', description);
        fd.append('groupIds', JSON.stringify(selectedGroups));
        fd.append('idolIds', JSON.stringify(selectedIdols));
        fd.append('tags', JSON.stringify(selectedTags));
        const res = await fetch('/api/photos', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
      }
      showToast(`Uploaded ${files.length} photo(s)!`, 'success');
      setFiles([]);
      setTitle('');
      setDescription('');
      setSelectedGroups([]);
      setSelectedIdols([]);
      setSelectedTags([]);
      onUploaded?.();
    } catch {
      showToast('Upload failed', 'error');
    }
    setUploading(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border-hover)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(233, 30, 140, 0.04)' : 'transparent',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
        />
        <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
        <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>
          Drop photos here or click to browse
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Supports JPG, PNG, GIF, WebP</div>
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {files.map((f, i) => (
            <div key={i} style={{
              position: 'relative', width: 80, height: 80, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)',
            }}>
              <img src={URL.createObjectURL(f)} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                style={{
                  position: 'absolute', top: 2, right: 2, background: 'rgba(255,75,110,0.9)', border: 'none',
                  color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="label">Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Optional title" />
        </div>
        <div>
          <label className="label">Tags</label>
          <TagInput selected={selectedTags} onChange={setSelectedTags} suggestions={tags} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">Description</label>
          <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ resize: 'vertical' }} placeholder="Optional description" />
        </div>
        <div>
          <label className="label">Groups</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {groups.map(g => (
              <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(g.id)}
                  onChange={e => setSelectedGroups(prev => e.target.checked ? [...prev, g.id] : prev.filter(id => id !== g.id))}
                />
                {g.name}
              </label>
            ))}
            {groups.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No groups yet</span>}
          </div>
        </div>
        <div>
          <label className="label">Idols</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {idols.map(i => (
              <label key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={selectedIdols.includes(i.id)}
                  onChange={e => setSelectedIdols(prev => e.target.checked ? [...prev, i.id] : prev.filter(id => id !== i.id))}
                />
                {i.name}
              </label>
            ))}
            {idols.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No idols yet</span>}
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        style={{ alignSelf: 'flex-start', padding: '12px 28px', fontSize: 15, opacity: files.length === 0 ? 0.6 : 1 }}
      >
        {uploading ? 'Uploading...' : `Upload ${files.length > 0 ? files.length + ' ' : ''}Photo${files.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}
