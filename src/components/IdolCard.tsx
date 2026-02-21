import React from 'react';
import Link from 'next/link';
import { Idol } from '@/types';

interface IdolCardProps {
  idol: Idol;
}

export default function IdolCard({ idol }: IdolCardProps) {
  return (
    <Link href={`/idols/${idol.id}`}>
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
          background: 'var(--primary-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, overflow: 'hidden', flexShrink: 0,
          border: '3px solid rgba(233, 30, 140, 0.2)',
        }}>
          ⭐
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{idol.name}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginTop: 6 }}>
            {idol.groups?.map(g => (
              <span key={g.id} className="tag-badge" style={{ fontSize: 11 }}>{g.name}</span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {idol.photo_count || 0} photos
          </div>
        </div>
      </div>
    </Link>
  );
}
