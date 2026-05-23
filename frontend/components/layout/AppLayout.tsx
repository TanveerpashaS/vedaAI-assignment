'use client';

import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import MobileTopbar from './MobileTopbar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  topbarTitle?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function AppLayout({ children, topbarTitle, showBack, backHref }: AppLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#e8e8e8' }} className="veda-app-shell">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Content */}
      <div>
        {/* Desktop topbar */}
        <div className="hidden lg:block" style={{ marginLeft: 220 }}>
          <Topbar title={topbarTitle} showBack={showBack} backHref={backHref} />
        </div>

        {/* Mobile topbar */}
        <MobileTopbar />

        {/* Page content */}
        <main className="lg:ml-[220px]">
          <div
            className="min-h-[calc(100vh-52px)] lg:min-h-[calc(100vh-52px)]"
            style={{ paddingBottom: 104, background: 'var(--veda-bg)' }}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
