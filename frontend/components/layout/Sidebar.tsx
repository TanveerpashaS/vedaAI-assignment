'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';

// VedaAI Logo
function VedaLogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ flexShrink: 0, display: 'block' }}>
      <defs>
        <linearGradient id="vg-sb" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb923c"/>
          <stop offset="50%" stopColor="#dc2626"/>
          <stop offset="100%" stopColor="#881337"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#vg-sb)"/>
      <path d="M15 25 L35 25 L50 65 L65 25 L85 25 L55 78 L45 78 Z" fill="white"/>
    </svg>
  );
}

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/groups',
    label: 'My Groups',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/assignments',
    label: 'Assignments',
    badge: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    href: '/ai-toolkit',
    label: "AI Teacher's Toolkit",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/library',
    label: 'My Library',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { assignments } = useAssignmentStore();
  const count = assignments.length;

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 z-30"
      style={{ width: 220, minHeight: '100vh', background: 'white', borderRight: '1px solid #f0f0f0' }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <VedaLogoIcon size={36} />
          <span style={{ fontWeight: 700, fontSize: 20, color: '#111827', letterSpacing: '-0.3px' }}>VedaAI</span>
        </Link>
      </div>

      {/* Create Assignment Button */}
      <div style={{ padding: '0 16px 24px' }}>
        <Link
          href="/assignments/create"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', background: '#111827', color: 'white',
            borderRadius: 999, padding: '11px 16px', fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Assignment
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                background: isActive ? '#f3f4f6' : 'transparent',
                color: isActive ? '#111827' : '#6b7280',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13, textDecoration: 'none',
              }}
            >
              <span style={{ color: isActive ? '#111827' : '#9ca3af', flexShrink: 0, display: 'flex' }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && count > 0 && (
                <span style={{
                  background: '#f97316', color: 'white', fontSize: 10, fontWeight: 700,
                  borderRadius: 999, minWidth: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                }}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0 10px 20px', marginTop: 'auto' }}>
        <div style={{ borderTop: '1px solid #f3f4f6', marginBottom: 4 }} />
        <Link href="/settings" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10, marginBottom: 8,
          color: '#6b7280', fontSize: 13, textDecoration: 'none',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Settings
        </Link>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#f9fafb', border: '1px solid #f0f0f0',
          borderRadius: 14, padding: '10px 12px',
        }}>
          <div style={{
            width: 38, height: 38, background: '#e5e7eb',
            borderRadius: '50%', border: '1px solid #d1d5db',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', lineHeight: 1.3, margin: 0 }} className="truncate">
              Delhi Public School
            </p>
            <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.3, margin: 0 }} className="truncate">
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
