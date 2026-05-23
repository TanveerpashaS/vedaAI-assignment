'use client';

import { GenerationProgress as PT } from '@/types';

interface Props { progress: PT | null; isVisible: boolean; }

export default function GenerationProgressUI({ progress, isVisible }: Props) {
  if (!isVisible || !progress) return null;

  const done = progress.status === 'completed';
  const fail = progress.status === 'failed';

  return (
    <>
      <style>{`
        @keyframes veda-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes veda-fadein {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes veda-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          50%  { transform: scale(1.12); opacity: 0.2; }
          100% { transform: scale(1);   opacity: 0.6; }
        }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 28,
          padding: '40px 32px 32px',
          maxWidth: 380,
          width: '100%',
          boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
          animation: 'veda-fadein 0.25s ease-out',
          textAlign: 'center',
        }}>

          {/* ── Logo area ── */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            {done ? (
              /* Success: logo + green ring */
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                {/* Static green ring */}
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0 }}>
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#22c55e" strokeWidth="3" opacity="0.3"/>
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="226" strokeDashoffset="0" strokeLinecap="round"/>
                </svg>
                {/* Logo */}
                <div style={{ position: 'absolute', inset: 8 }}>
                  <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
                    <defs>
                      <linearGradient id="vg-done" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fb923c"/>
                        <stop offset="55%" stopColor="#dc2626"/>
                        <stop offset="100%" stopColor="#881337"/>
                      </linearGradient>
                    </defs>
                    <rect width="100" height="100" rx="22" fill="url(#vg-done)"/>
                    <path d="M15 25 L35 25 L50 65 L65 25 L85 25 L55 78 L45 78 Z" fill="white"/>
                  </svg>
                </div>
                {/* Checkmark badge */}
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 24, height: 24,
                  background: '#22c55e', borderRadius: '50%',
                  border: '2.5px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>

            ) : fail ? (
              /* Fail: red circle with X */
              <div style={{ width: 72, height: 72, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>

            ) : (
              /* Processing: logo with separate spinning dashes below */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                {/* Logo — static, no ring overlapping */}
                <div style={{ position: 'relative' }}>
                  <svg width="72" height="72" viewBox="0 0 100 100" fill="none">
                    <defs>
                      <linearGradient id="vg-proc" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fb923c"/>
                        <stop offset="55%" stopColor="#dc2626"/>
                        <stop offset="100%" stopColor="#881337"/>
                      </linearGradient>
                    </defs>
                    <rect width="100" height="100" rx="22" fill="url(#vg-proc)"/>
                    <path d="M15 25 L35 25 L50 65 L65 25 L85 25 L55 78 L45 78 Z" fill="white"/>
                  </svg>
                </div>

                {/* Spinning dots row — separate from logo */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      style={{
                        width: 7, height: 7,
                        borderRadius: '50%',
                        background: i % 2 === 0 ? '#f97316' : '#dc2626',
                        animation: `veda-pulse-ring 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
            {done ? 'Question Paper Ready!' : fail ? 'Generation Failed' : 'Generating Question Paper'}
          </h3>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.55 }}>
            {progress.message}
          </p>

          {/* Progress bar */}
          {!fail && (
            <div style={{ marginBottom: done ? 0 : 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                <span style={{ fontWeight: 500 }}>Progress</span>
                <span style={{ fontWeight: 700, color: done ? '#16a34a' : '#111827' }}>
                  {progress.progress}%
                </span>
              </div>
              <div style={{ height: 8, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 999,
                  background: done
                    ? '#22c55e'
                    : 'linear-gradient(90deg, #f97316 0%, #dc2626 100%)',
                  width: `${progress.progress}%`,
                  transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            </div>
          )}

          {/* Step indicators */}
          {!done && !fail && (
            <div style={{ textAlign: 'left' }}>
              {[
                { t: 10, l: 'Starting AI generation...' },
                { t: 40, l: 'Generating questions...' },
                { t: 70, l: 'Structuring paper...' },
                { t: 90, l: 'Saving results...' },
              ]
                .filter(s => s.t <= progress.progress)
                .slice(-2)
                .map((s, i, arr) => {
                  const isLast = i === arr.length - 1;
                  return (
                    <div key={s.t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                        background: isLast ? '#f97316' : '#d1d5db',
                      }} />
                      <span style={{
                        fontSize: 12,
                        color: isLast ? '#374151' : '#9ca3af',
                        fontWeight: isLast ? 600 : 400,
                      }}>
                        {s.l}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}

          {fail && (
            <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>
              Please try again or check your API configuration.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
