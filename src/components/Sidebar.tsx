import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/photos', label: 'Photos', icon: '📸' },
  { href: '/upload', label: 'Upload', icon: '⬆️' },
  { href: '/groups', label: 'Groups', icon: '🎵' },
  { href: '/idols', label: 'Idols', icon: '⭐' },
  { href: '/tags', label: 'Tags', icon: '🏷️' },
];

export default function Sidebar() {
  const router = useRouter();
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minHeight: '100vh',
      background: 'rgba(255, 245, 249, 0.9)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
    }}>
      <div style={{ padding: '0 20px 28px' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 700,
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.5px',
        }}>
          KVault
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>K-pop Photo Vault</div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                margin: '2px 8px',
                borderRadius: 'var(--radius-md)',
                background: active ? 'rgba(233, 30, 140, 0.1)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>Made with 💗 for K-pop</div>
      </div>
    </aside>
  );
}
