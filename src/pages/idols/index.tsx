import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import IdolCard from '@/components/IdolCard';
import Modal from '@/components/Modal';
import { Group, Idol } from '@/types';
import { useToast } from '@/components/Toast';

export default function Idols() {
  const { showToast } = useToast();
  const [idols, setIdols] = useState<Idol[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  function fetchIdols() {
    fetch('/api/idols').then(r => r.json()).then(data => { setIdols(data); setLoading(false); });
  }

  useEffect(() => {
    fetchIdols();
    fetch('/api/groups').then(r => r.json()).then(setGroups);
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch('/api/idols', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), groupIds: selectedGroups }),
    });
    if (res.ok) {
      showToast('Idol created!', 'success');
      setName('');
      setSelectedGroups([]);
      setModal(false);
      fetchIdols();
    } else {
      showToast('Failed to create idol', 'error');
    }
    setSaving(false);
  }

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Idols</h1>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Idol</button>
      </div>
      <p className="page-subtitle">{idols.length} idol{idols.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : idols.length === 0 ? (
        <div className="empty-state">
          <div className="icon">⭐</div>
          <h3>No idols yet</h3>
          <p>Add your favourite K-pop idols</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal(true)}>Add Idol</button>
        </div>
      ) : (
        <div className="grid-4">
          {idols.map(i => <IdolCard key={i.id} idol={i} />)}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Idol">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jennie" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </div>
          {groups.length > 0 && (
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
              </div>
            </div>
          )}
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !name.trim()}>
            {saving ? 'Adding...' : 'Add Idol'}
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
