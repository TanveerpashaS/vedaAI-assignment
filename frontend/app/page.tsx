'use client';

import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { useAssignmentStore } from '@/store/assignmentStore';

export default function HomePage() {
  const { assignments } = useAssignmentStore();
  const completed = assignments.filter(a => a.status === 'completed').length;
  const pending = assignments.filter(a => a.status === 'pending' || a.status === 'processing').length;

  const stats = [
    { label: 'Total Assignments', value: assignments.length, color: '#f97316', bg: '#fff7ed' },
    { label: 'Generated Papers', value: completed, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'In Progress', value: pending, color: '#2563eb', bg: '#eff6ff' },
  ];

  const quickActions = [
    { label: 'Create Assignment', desc: 'Generate a new AI question paper', href: '/assignments/create', icon: '✦', color: '#f97316' },
    { label: 'View Assignments', desc: 'Browse all your assignments', href: '/assignments', icon: '📋', color: '#6366f1' },
    { label: 'AI Toolkit', desc: 'Explore AI teaching tools', href: '/ai-toolkit', icon: '🤖', color: '#0891b2' },
    { label: 'My Library', desc: 'Access saved resources', href: '/library', icon: '📚', color: '#16a34a' },
  ];

  return (
    <AppLayout>
      <div style={{ padding: '16px', maxWidth: 900, margin: '0 auto' }} className="sm:p-6">

        {/* Note banner */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 12, padding: '10px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.5 }}>
            This dashboard is built for reference — the core requirement was the assignment creation and AI generation flow. Explore the full experience from here.
          </p>
        </div>

        {/* Welcome */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}
            className="sm:text-2xl">
            Welcome back, John Doe 👋
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Delhi Public School, Bokaro Steel City
          </p>
        </div>

        {/* Stats — 1 col on mobile, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10, marginBottom: 24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: 'white', borderRadius: 14, padding: '16px 18px',
              border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: '0 0 4px' }}>{s.value}</p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions — 1 col on mobile, 2 on desktop */}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10, marginBottom: 24 }}>
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'white', borderRadius: 14, padding: '14px 16px',
              border: '1px solid #f0f0f0', textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: `${a.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {a.icon}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{a.label}</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Assignments */}
        {assignments.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Assignments</h2>
              <Link href="/assignments" style={{ fontSize: 13, color: '#f97316', textDecoration: 'none', fontWeight: 500 }}>
                View all →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {assignments.slice(0, 3).map((a) => {
                const statusColor = a.status === 'completed' ? '#16a34a' : a.status === 'failed' ? '#dc2626' : '#f97316';
                const statusBg = a.status === 'completed' ? '#f0fdf4' : a.status === 'failed' ? '#fef2f2' : '#fff7ed';
                return (
                  <Link key={a._id} href={`/assignments/${a._id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'white', borderRadius: 12, padding: '12px 14px',
                    border: '1px solid #f0f0f0', textDecoration: 'none', gap: 8,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }} className="truncate">{a.title}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{a.subject} • {a.className}</p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', flexShrink: 0,
                      borderRadius: 999, background: statusBg, color: statusColor,
                    }}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
