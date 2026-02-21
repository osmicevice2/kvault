import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { Tag } from '@/types';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function Tags() {
  const { showToast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  function fetchTags() {
    fetch('/api/tags').then(r => r.json()).then(data => { setTags(data); setLoading(false); });
  }

  useEffect(() => { fetchTags(); }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      showToast('Tag created!', 'success');
      setName('');
      setModal(false);
      fetchTags();
    } else {
      showToast('Failed to create tag', 'error');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this tag?')) return;
    const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Tag deleted', 'success');
      setTags(prev => prev.filter(t => t.id !== id));
    } else {
      showToast('Failed to delete', 'error');
    }
  }

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Tags</h1>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Tag</button>
      </div>
      <p className="page-subtitle">{tags.length} tag{tags.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : tags.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🏷️</div>
          <h3>No tags yet</h3>
          <p>Tags are auto-created when you upload photos. You can also create them manually.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal(true)}>Create Tag</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {tags.map(tag => (
            <div key={tag.id} className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href={`/photos?tagId=${tag.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🏷️</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{tag.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tag.photo_count || 0} photos</span>
              </Link>
              <button
                onClick={() => handleDelete(tag.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1 }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Create Tag">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Tag Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. concert" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !name.trim()}>
            {saving ? 'Creating...' : 'Create Tag'}
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
