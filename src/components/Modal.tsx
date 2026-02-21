import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
}

export default function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(45, 27, 46, 0.5)',
        backdropFilter: 'blur(4px)',
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
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          overflow: 'auto',
          padding: 24,
        }}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
