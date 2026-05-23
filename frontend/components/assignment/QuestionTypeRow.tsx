'use client';

import { useState, useRef, useEffect } from 'react';
import { QuestionType, QUESTION_TYPE_OPTIONS } from '@/types';

interface Props {
  questionType: QuestionType;
  onUpdate: (field: keyof QuestionType, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
  mobile?: boolean;
}

export default function QuestionTypeRow({ questionType, onUpdate, onRemove, canRemove, mobile = false }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const stepperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
    background: 'white',
    height: 36,
  };

  const Stepper = ({ value, onMinus, onPlus }: { value: number; onMinus: () => void; onPlus: () => void }) => (
    <div style={stepperStyle}>
      <button
        type="button"
        onClick={onMinus}
        style={{ width: 32, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 16 }}
      >
        −
      </button>
      <span style={{ width: 36, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#111827', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
        {value}
      </span>
      <button
        type="button"
        onClick={onPlus}
        style={{ width: 32, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 16 }}
      >
        +
      </button>
    </div>
  );

  const Selector = ({ fullWidth = false }: { fullWidth?: boolean }) => (
    <div ref={ref} style={{ position: 'relative', flex: fullWidth ? 1 : undefined, minWidth: fullWidth ? 0 : 200 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 12px',
          border: open ? '1px solid #9ca3af' : '1px solid #e5e7eb',
          borderRadius: 12,
          fontSize: 13,
          background: '#fafafa',
          color: '#374151',
          height: 36,
          boxShadow: open ? '0 0 0 3px rgba(17,24,39,0.06)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        <span className="truncate text-left" style={{ fontWeight: 500 }}>{questionType.type}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          style={{ flexShrink: 0, marginLeft: 8, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="animate-scale-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            zIndex: 50,
            maxHeight: 220,
            overflowY: 'auto',
            padding: 4,
          }}
        >
          {QUESTION_TYPE_OPTIONS.map((opt) => {
            const selected = questionType.type === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => { onUpdate('type', opt); setOpen(false); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  fontSize: 13,
                  borderRadius: 10,
                  background: selected ? '#f3f4f6' : 'transparent',
                  color: selected ? '#111827' : '#374151',
                  fontWeight: selected ? 600 : 400,
                }}
                className="hover:bg-gray-50"
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const XBtn = () => canRemove ? (
    <button type="button" onClick={onRemove} style={{ padding: 6, flexShrink: 0 }} aria-label="Remove question type">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  ) : <div style={{ width: 26, flexShrink: 0 }} />;

  if (mobile) {
    return (
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Selector fullWidth />
          <XBtn />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 500 }}>No. of Questions</p>
            <Stepper value={questionType.count} onMinus={() => onUpdate('count', Math.max(1, questionType.count - 1))} onPlus={() => onUpdate('count', questionType.count + 1)} />
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 500 }}>Marks</p>
            <Stepper value={questionType.marks} onMinus={() => onUpdate('marks', Math.max(1, questionType.marks - 1))} onPlus={() => onUpdate('marks', questionType.marks + 1)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 28px 110px 110px', gap: 10, alignItems: 'center' }}>
      <Selector fullWidth />
      <XBtn />
      <Stepper value={questionType.count} onMinus={() => onUpdate('count', Math.max(1, questionType.count - 1))} onPlus={() => onUpdate('count', questionType.count + 1)} />
      <Stepper value={questionType.marks} onMinus={() => onUpdate('marks', Math.max(1, questionType.marks - 1))} onPlus={() => onUpdate('marks', questionType.marks + 1)} />
    </div>
  );
}
