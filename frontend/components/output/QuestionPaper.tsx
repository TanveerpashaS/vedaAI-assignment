'use client';

import { GeneratedPaper } from '@/types';

const diffLabel = (d: string) =>
  d === 'easy' ? 'Easy' : d === 'hard' ? 'Challenging' : 'Moderate';

const diffBadge = (d: string): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '1px 7px',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    lineHeight: 1.6,
    verticalAlign: 'middle',
    marginLeft: 6,
  };
  if (d === 'easy')  return { ...base, background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
  if (d === 'hard')  return { ...base, background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' };
  return              { ...base, background: '#fef9c3', color: '#a16207', border: '1px solid #fef08a' };
};

function parseQuestion(text: string): { question: string; options: string[] } {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const firstOpt = lines.findIndex(l => /^[A-Da-d][).\s]/.test(l));
  if (firstOpt > 0) {
    return { question: lines.slice(0, firstOpt).join(' '), options: lines.slice(firstOpt) };
  }
  return { question: lines.join(' '), options: [] };
}

export default function QuestionPaper({
  paper,
  printMode = false,
}: {
  paper: GeneratedPaper;
  printMode?: boolean;
}) {
  return (
    <>
      <style>{`
        .qp-root {
          background: white;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Each question row */
        .qp-q-row {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
        }
        .qp-q-num {
          flex-shrink: 0;
          min-width: 22px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          padding-top: 1px;
        }
        .qp-q-body { flex: 1; min-width: 0; }

        /* The main question line:
           [question text + inline badge] .... [marks far right] */
        .qp-q-line {
          display: flex;
          align-items: baseline;
          gap: 0;
          width: 100%;
        }
        /* Question text + badge grow together */
        .qp-q-left {
          flex: 1;
          min-width: 0;
          font-size: 13px;
          color: #1f2937;
          line-height: 1.65;
        }
        /* Marks pinned to far right */
        .qp-marks {
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
          margin-left: 12px;
          padding-top: 1px;
        }

        /* MCQ options — 2 col on desktop, 1 col on mobile */
        .qp-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px 24px;
          margin-top: 6px;
          padding-left: 2px;
        }
        .qp-opt {
          font-size: 13px;
          color: #374151;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 480px) {
          .qp-options { grid-template-columns: 1fr !important; gap: 2px 0 !important; }
          .qp-marks { margin-left: 8px; }
        }

        @media print {
          .qp-root { border: none !important; border-radius: 0 !important; }
          .diff-badge-screen { display: none !important; }
        }
      `}</style>

      <div className="qp-root" id="question-paper">

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '24px 20px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{paper.schoolName}</h1>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 2px' }}>Subject: {paper.subject}</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>Class: {paper.className}</p>
        </div>

        {/* Meta */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 13, color: '#374151' }}>
            <span><strong>Time Allowed:</strong> {paper.timeAllowed}</span>
            <span><strong>Maximum Marks: {paper.maximumMarks}</strong></span>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', margin: '8px 0 0' }}>
            All questions are compulsory unless stated otherwise.
          </p>
        </div>

        {/* Student Info */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}>
          {[{ label: 'Name:', w: 180 }, { label: 'Roll Number:', w: 140 }].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#374151', whiteSpace: 'nowrap', flexShrink: 0 }}>{item.label}</span>
              <div style={{ width: item.w, borderBottom: '1.5px solid #6b7280', height: 20 }} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#374151', whiteSpace: 'nowrap', flexShrink: 0 }}>Section:</span>
            <div style={{ width: 80, borderBottom: '1.5px solid #6b7280', height: 20 }} />
            
          </div>
        </div>

        {/* Sections */}
        <div style={{ padding: '20px' }}>
          {paper.sections.map((section, sIdx) => (
            <div key={section.id} style={{ marginBottom: sIdx < paper.sections.length - 1 ? 28 : 0 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', textAlign: 'center', margin: '0 0 4px' }}>
                {section.title}
              </h2>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', margin: '0 0 2px' }}>{section.questionType}</p>
              <p style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', margin: '0 0 14px' }}>{section.instruction}</p>

              {section.questions.map((q, idx) => {
                const { question, options } = parseQuestion(q.text);
                const diff = diffLabel(q.difficulty);
                const marks = `[${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;

                return (
                  <div key={q.id} className="qp-q-row">
                    <span className="qp-q-num">{idx + 1}.</span>
                    <div className="qp-q-body">

                      {/* ── Main line: question + badge inline + marks far right ── */}
                      <div className="qp-q-line">
                        <span className="qp-q-left">
                          {/* In print mode: [Easy] as plain text before question */}
                          {printMode && (
                            <span style={{ fontWeight: 600, marginRight: 4 }}>[{diff}]</span>
                          )}
                          {question}
                          {/* On screen: colored badge right after question text */}
                          {!printMode && (
                            <span className="diff-badge-screen" style={diffBadge(q.difficulty)}>
                              {diff}
                            </span>
                          )}
                        </span>
                        <span className="qp-marks">{marks}</span>
                      </div>

                      {/* MCQ options */}
                      {options.length > 0 && (
                        <div className="qp-options">
                          {options.map((opt, i) => (
                            <p key={i} className="qp-opt">{opt}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 20, marginBottom: 0 }}>
            End of Question Paper
          </p>
        </div>

        {/* Answer Key */}
        {paper.answerKey && paper.answerKey.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Answer Key:</h3>
            {paper.answerKey.map((ak, i) => (
              <div key={ak.questionId} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', flexShrink: 0, minWidth: 22 }}>{i + 1}.</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {ak.answer.split('\n').map((line, li) => (
                    <p key={li} style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.65, margin: li > 0 ? '3px 0 0' : 0, wordBreak: 'break-word' }}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
