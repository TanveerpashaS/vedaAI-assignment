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
      <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
            Welcome back, John Doe 👋
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Delhi Public School, Bokaro Steel City
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: 'white', borderRadius: 16, padding: '18px 20px',
              border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: '0 0 4px' }}>{s.value}</p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 28 }}>
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'white', borderRadius: 16, padding: '16px 18px',
              border: '1px solid #f0f0f0', textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.15s',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${a.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Assignments</h2>
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
                    background: 'white', borderRadius: 14, padding: '14px 16px',
                    border: '1px solid #f0f0f0', textDecoration: 'none',
                  }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{a.title}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{a.subject} • {a.className}</p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px',
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
