'use client';

import { useRouter } from 'next/navigation';
import VedaLogo from '@/components/brand/VedaLogo';

interface TopbarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function Topbar({ title, showBack, backHref }: TopbarProps) {
  const router = useRouter();
  const handleBack = () => (backHref ? router.push(backHref) : router.back());

  return (
    <header
      className="flex items-center justify-between sticky top-0 z-20"
      style={{ height: 52, background: 'var(--veda-bg)', borderBottom: '1px solid #ebebeb', paddingLeft: 16, paddingRight: 16 }}
    >
      {/* Left: back + breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
            style={{ width: 30, height: 30, flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}
        {title && (
          <div className="flex items-center gap-1.5 min-w-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span style={{ fontSize: 13, color: '#6b7280' }} className="truncate">{title}</span>
          </div>
        )}
      </div>

      {/* Mobile: centered logo */}
      <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
        <VedaLogo size="sm" href="/" />
      </div>

      {/* Right: bell + hamburger menu (mobile) / avatar (desktop) */}
      <div className="flex items-center gap-1">
        {/* Bell */}
        <button
          className="relative flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          style={{ width: 34, height: 34 }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span
            className="absolute rounded-full"
            style={{ width: 7, height: 7, background: '#ef4444', top: 6, right: 6, border: '1.5px solid white' }}
          />
        </button>

        {/* Mobile: Hamburger menu */}
        <button
          className="lg:hidden flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          style={{ width: 34, height: 34 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Desktop: Avatar + name */}
        <button
          className="hidden lg:flex items-center gap-1.5 rounded-lg transition-colors hover:bg-gray-100"
          style={{ padding: '4px 8px' }}
        >
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{
              width: 28, height: 28,
              background: 'linear-gradient(135deg, #fb923c, #ea580c)',
            }}
          >
            <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>J</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>John Doe</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
