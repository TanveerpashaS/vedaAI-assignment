'use client';

import { useRouter } from 'next/navigation';

interface Props {
  title: string;
  backHref?: string;
}

export default function MobilePageHeader({ title, backHref }: Props) {
  const router = useRouter();
  const goBack = () => (backHref ? router.push(backHref) : router.back());

  return (
    <div
      className="lg:hidden flex items-center gap-2"
      style={{ padding: '12px 16px 8px', background: '#d4d4d4' }}
    >
      <button
        type="button"
        onClick={goBack}
        className="flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
        style={{ width: 32, height: 32, flexShrink: 0 }}
        aria-label="Go back"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{title}</span>
    </div>
  );
}
