'use client';

import { useState, useRef, useEffect } from 'react';
import { Assignment } from '@/types';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import toast from 'react-hot-toast';

interface Props {
  assignment: Assignment;
  mobile?: boolean;
}

function fmt(d: string) {
  try {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`;
  } catch { return d; }
}

const ThreeDots = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af">
    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
  </svg>
);

export default function AssignmentCard({ assignment, mobile = false }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { deleteAssignment } = useAssignmentStore();

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const view = () => { router.push(`/assignments/${assignment._id}`); setOpen(false); };
  const del = async () => {
    setOpen(false);
    if (!confirm('Delete this assignment?')) return;
    try { await deleteAssignment(assignment._id); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const Menu = () => (
    <div ref={ref} className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="More options"
      >
        <ThreeDots />
      </button>
      {open && (
        <div
          className="absolute right-0 top-7 z-50 min-w-[148px] overflow-hidden animate-scale-in"
          style={{
            background: 'white',
            borderRadius: 14,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            border: '1px solid #f0f0f0',
            padding: '6px 0',
          }}
        >
          <button
            type="button"
            onClick={view}
            className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            View Assignment
          </button>
          <button
            type="button"
            onClick={del}
            className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );

  const cardStyle = {
    background: 'white',
    borderRadius: mobile ? 16 : 20,
    border: '1px solid #f0f0f0',
    boxShadow: 'var(--veda-shadow-card)',
    cursor: 'pointer' as const,
  };

  if (mobile) {
    return (
      <div style={{ ...cardStyle, padding: '14px 16px' }} onClick={view}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }} className="truncate">
              {assignment.title}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              <span>Assigned on: <span style={{ color: '#374151' }}>{fmt(assignment.createdAt)}</span></span>
              {assignment.dueDate && (
                <span>Due: <span style={{ color: '#374151' }}>{fmt(assignment.dueDate)}</span></span>
              )}
            </div>
          </div>
          <Menu />
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...cardStyle, padding: '18px 20px' }} onClick={view} className="group hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-2" style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.3, margin: 0 }}>
          {assignment.title}
        </h3>
        <Menu />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
        <span>Assigned on: <span style={{ color: '#374151', fontWeight: 500 }}>{fmt(assignment.createdAt)}</span></span>
        {assignment.dueDate && (
          <span>Due : <span style={{ color: '#374151', fontWeight: 500 }}>{fmt(assignment.dueDate)}</span></span>
        )}
      </div>
    </div>
  );
}
