import React from 'react';
import Link from 'next/link';
import { Group } from '@/types';

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <div className="card" style={{
        padding: 20,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        textAlign: 'center',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = '';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '';
        }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: group.image_path ? 'none' : 'var(--primary-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, overflow: 'hidden', flexShrink: 0,
          border: '3px solid rgba(233, 30, 140, 0.2)',
        }}>
          {group.image_path
            ? <img src={`/api/photos/serve/${group.id}?type=group`} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🎵'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{group.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {group.photo_count || 0} photos · {group.idol_count || 0} idols
          </div>
        </div>
      </div>
    </Link>
  );
}
