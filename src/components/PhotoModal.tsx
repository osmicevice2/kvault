import React, { useEffect, useState } from 'react';
import { Photo } from '@/types';
import { useToast } from './Toast';

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
  onDeleted: (id: number) => void;
  onUpdated: (photo: Photo) => void;
}

export default function PhotoModal({ photo, onClose, onDeleted, onUpdated }: PhotoModalProps) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (photo) {
      setTitle(photo.title || '');
      setDescription(photo.description || '');
      setEditing(false);
    }
  }, [photo]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!photo) return null;

  async function handleDelete() {
    if (!confirm('Delete this photo?')) return;
    const res = await fetch(`/api/photos/${photo!.id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Photo deleted', 'success');
      onDeleted(photo!.id);
      onClose();
    } else {
      showToast('Failed to delete', 'error');
    }
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/photos/${photo!.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    if (res.ok) {
      const updated = await res.json();
      showToast('Saved!', 'success');
      onUpdated(updated);
      setEditing(false);
    } else {
      showToast('Failed to save', 'error');
    }
    setSaving(false);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(45, 27, 46, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          maxWidth: 900,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
      >
        <div style={{ flex: 1, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <img
            src={`/api/photos/serve/${photo.id}`}
            alt={photo.title || 'Photo'}
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          />
        </div>
        <div style={{ width: 300, padding: 24, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>
              {photo.title || 'Untitled'}
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}>✕</button>
          </div>

          {editing ? (
            <>
              <div>
                <label className="label">Title</label>
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              {photo.description && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{photo.description}</p>
              )}
              {photo.groups && photo.groups.length > 0 && (
                <div>
                  <div className="label">Groups</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {photo.groups.map(g => <span key={g.id} className="tag-badge">{g.name}</span>)}
                  </div>
                </div>
              )}
              {photo.idols && photo.idols.length > 0 && (
                <div>
                  <div className="label">Idols</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {photo.idols.map(i => <span key={i.id} className="tag-badge">⭐ {i.name}</span>)}
                  </div>
                </div>
              )}
              {photo.tags && photo.tags.length > 0 && (
                <div>
                  <div className="label">Tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {photo.tags.map(t => <span key={t.id} className="tag-badge">#{t.name}</span>)}
                  </div>
                </div>
              )}
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Uploaded: {new Date(photo.upload_date).toLocaleDateString()}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <button className="btn btn-secondary" onClick={() => setEditing(true)} style={{ flex: 1 }}>Edit</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
