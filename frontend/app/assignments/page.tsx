'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAssignmentStore } from '@/store/assignmentStore';
import AppLayout from '@/components/layout/AppLayout';
import MobilePageHeader from '@/components/layout/MobilePageHeader';
import AssignmentCard from '@/components/assignment/AssignmentCard';
import EmptyState from '@/components/assignment/EmptyState';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

export default function AssignmentsPage() {
  const { assignments, isLoading, searchQuery, filterStatus, fetchAssignments, setSearchQuery } = useAssignmentStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  useSocket();

  const handleCreateClick = () => {
    setIsNavigating(true);
    setTimeout(() => router.push('/assignments/create'), 600);
  };

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleSearch = useCallback((v: string) => {
    setLocalSearch(v);
    setSearchQuery(v);
    fetchAssignments({ search: v, status: filterStatus });
  }, [fetchAssignments, filterStatus, setSearchQuery]);

  const isEmpty = !isLoading && assignments.length === 0;
  const hasItems = !isLoading && assignments.length > 0;

  const Spinner = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div
        className="animate-spin"
        style={{ width: 32, height: 32, border: '2.5px solid #e5e7eb', borderTopColor: '#111827', borderRadius: '50%' }}
      />
    </div>
  );

  const SearchFilterRow = ({ mobile = false }: { mobile?: boolean }) => (
    <div style={{ display: 'flex', gap: 10, marginBottom: mobile ? 12 : 20 }}>
      <button
        type="button"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'white', border: '1px solid #e5e7eb',
          borderRadius: 12, padding: mobile ? '9px 12px' : '9px 14px',
          fontSize: 13, color: '#6b7280', cursor: 'pointer',
          whiteSpace: 'nowrap', flexShrink: 0,
          boxShadow: 'var(--veda-shadow-card)',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        {mobile ? 'Filter' : 'Filter By'}
      </button>
      <div style={{ position: 'relative', flex: 1 }}>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        >
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder={mobile ? 'Search Name' : 'Search Assignment'}
          value={localSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            width: '100%', paddingLeft: 36, paddingRight: 16,
            paddingTop: 9, paddingBottom: 9,
            border: '1px solid #e5e7eb', borderRadius: 12,
            fontSize: 13, background: 'white', color: '#111827',
            outline: 'none', boxSizing: 'border-box',
            boxShadow: 'var(--veda-shadow-card)',
          }}
        />
      </div>
    </div>
  );

  return (
    <AppLayout topbarTitle="Assignment" showBack>

      {/* ─── DESKTOP ─── */}
      <div className="hidden lg:block" style={{ padding: '20px 24px 100px' }}>
        {hasItems && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1.2, margin: 0 }}>
                  Assignments
                </h1>
              </div>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                Manage and create assignments for your classes.
              </p>
            </div>
            <SearchFilterRow />
          </>
        )}

        {isLoading ? (
          <Spinner />
        ) : isEmpty ? (
          <div style={{ minHeight: 'calc(100vh - 52px - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState />
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {assignments.map((a, i) => (
                <div key={a._id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <AssignmentCard assignment={a} />
                </div>
              ))}
            </div>

            <div style={{ position: 'fixed', bottom: 28, left: 'calc(110px + 50%)', transform: 'translateX(-50%)', zIndex: 30 }}>
              <style>{`
                @keyframes floatPulse {
                  0%, 100% { box-shadow: 0 6px 20px rgba(0,0,0,0.22), 0 0 0 0 rgba(249,115,22,0.6); }
                  50% { box-shadow: 0 6px 20px rgba(0,0,0,0.22), 0 0 0 6px rgba(249,115,22,0.1); }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
              <button
                onClick={handleCreateClick}
                disabled={isNavigating}
                className="veda-btn-primary"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '13px 22px', fontSize: 14,
                  border: '2px solid #f97316',
                  cursor: isNavigating ? 'not-allowed' : 'pointer',
                  opacity: isNavigating ? 0.85 : 1,
                  minWidth: 180, justifyContent: 'center',
                  animation: isNavigating ? 'none' : 'floatPulse 2s ease-in-out infinite',
                }}
              >
                {isNavigating ? (
                  <>
                    <div style={{
                      width: 14, height: 14,
                      border: '2px solid rgba(255,255,255,0.35)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Assignment
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ─── MOBILE ─── */}
      <div className="lg:hidden" style={{ minHeight: 'calc(100vh - 52px)', background: '#d4d4d4' }}>
        {hasItems && <MobilePageHeader title="Assignments" backHref="/" />}

        <div style={{ padding: hasItems ? '0 12px 100px' : 0 }}>
          {isLoading ? (
            <Spinner />
          ) : isEmpty ? (
            <div style={{ background: 'var(--veda-bg)', minHeight: 'calc(100vh - 52px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState />
            </div>
          ) : (
            <>
              <div style={{ padding: '8px 0 0' }}>
                <SearchFilterRow mobile />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {assignments.map((a, i) => (
                  <div key={a._id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <AssignmentCard assignment={a} mobile />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ position: 'fixed', bottom: 88, right: 16, zIndex: 30 }}>
          <Link
            href="/assignments/create"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52,
              background: 'white',
              borderRadius: '50%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              textDecoration: 'none',
            }}
            aria-label="Create assignment"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
        </div>
      </div>

    </AppLayout>
  );
}
