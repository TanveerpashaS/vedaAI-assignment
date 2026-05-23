'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Exact icons matching the Figma design
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="9" height="9" rx="2" fill={active ? 'white' : '#6b7280'}/>
    <rect x="13" y="2" width="9" height="9" rx="2" fill={active ? 'white' : '#6b7280'}/>
    <rect x="2" y="13" width="9" height="9" rx="2" fill={active ? 'white' : '#6b7280'}/>
    <rect x="13" y="13" width="9" height="9" rx="2" fill={active ? 'white' : '#6b7280'}/>
  </svg>
);

const AssignmentsIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    {/* Rounded rectangle body */}
    <rect x="3" y="4" width="18" height="16" rx="3" fill={active ? 'white' : '#6b7280'}/>
    {/* Lines cut out */}
    <rect x="6" y="9" width="12" height="2" rx="1" fill={active ? '#1a1a1a' : '#1a1a1a'} opacity={active ? 1 : 0.4}/>
    <rect x="6" y="13" width="8" height="2" rx="1" fill={active ? '#1a1a1a' : '#1a1a1a'} opacity={active ? 1 : 0.4}/>
    {/* Top tab */}
    <rect x="8" y="2" width="8" height="4" rx="1.5" fill={active ? 'white' : '#6b7280'}/>
  </svg>
);

const LibraryIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    {/* Document with + */}
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill={active ? 'white' : '#6b7280'}/>
    <line x1="12" y1="11" x2="12" y2="17" stroke={active ? '#1a1a1a' : '#1a1a1a'} strokeWidth="2" strokeLinecap="round" opacity={active ? 1 : 0.4}/>
    <line x1="9" y1="14" x2="15" y2="14" stroke={active ? '#1a1a1a' : '#1a1a1a'} strokeWidth="2" strokeLinecap="round" opacity={active ? 1 : 0.4}/>
  </svg>
);

const AIToolkitIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    {/* Sparkle/star icon */}
    <path d="M12 2 L13.5 9 L20 10 L13.5 11 L12 18 L10.5 11 L4 10 L10.5 9 Z" fill={active ? 'white' : '#6b7280'}/>
    <path d="M19 2 L19.8 5 L22 5.5 L19.8 6 L19 9 L18.2 6 L16 5.5 L18.2 5 Z" fill={active ? 'white' : '#6b7280'} opacity="0.8"/>
  </svg>
);

const navItems = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/assignments', label: 'Assignments', Icon: AssignmentsIcon },
  { href: '/library', label: 'Library', Icon: LibraryIcon },
  { href: '/ai-toolkit', label: 'AI Toolkit', Icon: AIToolkitIcon },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        padding: '0 12px 16px',
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      {/* The floating pill nav */}
      <nav
        style={{
          background: '#1a1a1a',
          borderRadius: 28,
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          height: 72,
          pointerEvents: 'all',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        }}
      >
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const { Icon } = item;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                textDecoration: 'none',
                padding: '8px 4px',
                borderRadius: 16,
              }}
            >
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Icon active={isActive} />
                {isActive && (
                  <span style={{ position: 'absolute', bottom: -6, width: 20, height: 3, background: 'white', borderRadius: 2 }} />
                )}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? 'white' : '#6b7280',
                  lineHeight: 1,
                  marginTop: 2,
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* iOS home indicator space */}
      <div style={{ height: 4 }} />
    </div>
  );
}
