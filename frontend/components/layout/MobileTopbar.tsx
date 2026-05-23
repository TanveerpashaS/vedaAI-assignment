'use client';

import VedaLogo from '@/components/brand/VedaLogo';

export default function MobileTopbar() {
  return (
    <div
      className="lg:hidden sticky top-0 z-20"
      style={{ background: '#d4d4d4', padding: '10px 12px 0' }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <VedaLogo size="sm" />

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Bell with orange dot */}
          <button
            style={{
              position: 'relative',
              width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              borderRadius: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {/* Orange notification dot */}
            <span
              style={{
                position: 'absolute',
                top: 5, right: 5,
                width: 8, height: 8,
                background: '#f97316',
                borderRadius: '50%',
                border: '1.5px solid white',
              }}
            />
          </button>

          {/* Avatar - real person photo style */}
          <button
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #e5e7eb',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>J</span>
          </button>

          {/* Hamburger */}
          <button
            style={{
              width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              borderRadius: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
