import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import GroupCard from '@/components/GroupCard';
import Modal from '@/components/Modal';
import { Group } from '@/types';
import { useToast } from '@/components/Toast';

export default function Groups() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  function fetchGroups() {
    fetch('/api/groups').then(r => r.json()).then(data => { setGroups(data); setLoading(false); });
  }

  useEffect(() => { fetchGroups(); }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      showToast('Group created!', 'success');
      setName('');
      setModal(false);
      fetchGroups();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to create group', 'error');
    }
    setSaving(false);
  }

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Groups</h1>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Group</button>
      </div>
      <p className="page-subtitle">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎵</div>
          <h3>No groups yet</h3>
          <p>Create your first K-pop group</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal(true)}>Create Group</button>
        </div>
      ) : (
        <div className="grid-4">
          {groups.map(g => <GroupCard key={g.id} group={g} />)}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Create Group">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Group Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. BLACKPINK" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !name.trim()}>
            {saving ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
