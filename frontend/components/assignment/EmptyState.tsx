'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmptyState() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = () => {
    setIsNavigating(true);
    setTimeout(() => router.push('/assignments/create'), 600);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px 40px',
      }}
    >
      {/* Illustration */}
      <div style={{ marginBottom: 24, position: 'relative' }}>
        <svg
          width="240"
          height="210"
          viewBox="0 0 240 210"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Large soft circle background */}
          <circle cx="120" cy="100" r="88" fill="#e8e4f0" opacity="0.6"/>
          <circle cx="120" cy="100" r="70" fill="#e8e4f0" opacity="0.7"/>

          {/* Sparkle top-left */}
          <path d="M42 44 L44 38 L46 44 L52 46 L46 48 L44 54 L42 48 L36 46 Z" fill="#93c5fd" opacity="0.9"/>

          {/* Blue dot right */}
          <circle cx="192" cy="112" r="5.5" fill="#60a5fa" opacity="0.9"/>

          {/* Sparkle bottom-left */}
          <path d="M58 158 L59.5 153 L61 158 L66 159.5 L61 161 L59.5 166 L58 161 L53 159.5 Z" fill="#93c5fd" opacity="0.8"/>

          {/* Back document (rotated slightly) */}
          <g transform="rotate(7, 115, 90)">
            <rect x="78" y="32" width="78" height="96" rx="9" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1"/>
            <rect x="90" y="50" width="42" height="5" rx="2.5" fill="#d1d5db"/>
            <rect x="90" y="61" width="34" height="5" rx="2.5" fill="#d1d5db"/>
            <rect x="90" y="72" width="38" height="5" rx="2.5" fill="#d1d5db"/>
          </g>

          {/* Front document */}
          <rect x="78" y="30" width="78" height="96" rx="9" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>

          {/* Document lines */}
          <rect x="90" y="48" width="42" height="5" rx="2.5" fill="#1f2937"/>
          <rect x="90" y="60" width="34" height="5" rx="2.5" fill="#e5e7eb"/>
          <rect x="90" y="71" width="38" height="5" rx="2.5" fill="#e5e7eb"/>
          <rect x="90" y="82" width="28" height="5" rx="2.5" fill="#e5e7eb"/>

          {/* Small card top-right of document */}
          <rect x="148" y="36" width="32" height="22" rx="5" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
          <rect x="153" y="42" width="18" height="3" rx="1.5" fill="#e5e7eb"/>
          <rect x="153" y="48" width="12" height="3" rx="1.5" fill="#e5e7eb"/>

          {/* Pen/pencil decoration */}
          <path d="M74 46 Q66 38 60 30 Q57 26 61 24 Q65 22 68 26 L76 42 Z" fill="#6b7280" opacity="0.35"/>

          {/* Magnifying glass outer ring */}
          <circle cx="148" cy="126" r="34" fill="white" stroke="#d1d5db" strokeWidth="2"/>
          {/* Inner ring */}
          <circle cx="148" cy="126" r="26" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>

          {/* Red X circle */}
          <circle cx="148" cy="126" r="20" fill="#ef4444"/>
          <line x1="140" y1="118" x2="156" y2="134" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="156" y1="118" x2="140" y2="134" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>

          {/* Magnifier handle */}
          <line x1="167" y1="145" x2="182" y2="160" stroke="#9ca3af" strokeWidth="6" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Text */}
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#111827',
          marginBottom: 10,
          textAlign: 'center',
          margin: '0 0 10px 0',
        }}
      >
        No assignments yet
      </h2>
      <p
        style={{
          fontSize: 13,
          color: '#6b7280',
          textAlign: 'center',
          maxWidth: 300,
          lineHeight: 1.65,
          margin: '0 0 28px 0',
        }}
      >
        Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      {/* CTA */}
      <button
        onClick={handleClick}
        disabled={isNavigating}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: '#111827',
          color: 'white',
          borderRadius: 999,
          padding: '13px 26px',
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          cursor: isNavigating ? 'not-allowed' : 'pointer',
          opacity: isNavigating ? 0.85 : 1,
          minWidth: 220,
        }}
      >
        {isNavigating ? (
          <>
            <div style={{
              width: 14, height: 14,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            Creating...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Your First Assignment
          </>
        )}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
