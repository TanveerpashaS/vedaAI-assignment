'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useAssignmentSocket } from '@/hooks/useSocket';
import AppLayout from '@/components/layout/AppLayout';
import MobilePageHeader from '@/components/layout/MobilePageHeader';
import QuestionPaper from '@/components/output/QuestionPaper';
import { exportToPDF } from '@/utils/pdfExport';
import toast from 'react-hot-toast';

export default function AssignmentDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { currentAssignment, generationProgress, isLoading, fetchAssignment, regenerateAssignment } = useAssignmentStore();
  const [exporting, setExporting] = useState(false);
  const [regen, setRegen] = useState(false);

  useAssignmentSocket(id);

  useEffect(() => { fetchAssignment(id); }, [id, fetchAssignment]);

  useEffect(() => {
    if (currentAssignment?.status === 'processing' || currentAssignment?.status === 'pending') {
      const t = setInterval(() => fetchAssignment(id), 3000);
      return () => clearInterval(t);
    }
  }, [currentAssignment?.status, id, fetchAssignment]);

  const handlePDF = async () => {
    if (!currentAssignment?.generatedPaper) return;
    setExporting(true);
    try { await exportToPDF(currentAssignment.generatedPaper); toast.success('PDF downloaded'); }
    catch { toast.error('PDF export failed'); }
    finally { setExporting(false); }
  };

  const handleRegen = async () => {
    setRegen(true);
    try { await regenerateAssignment(id); toast.success('Regeneration started'); }
    catch { toast.error('Failed'); }
    finally { setRegen(false); }
  };

  const Spinner = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div className="animate-spin" style={{ width: 32, height: 32, border: '2.5px solid #e5e7eb', borderTopColor: '#111827', borderRadius: '50%' }} />
    </div>
  );

  if (isLoading && !currentAssignment) {
    return (
      <AppLayout topbarTitle="Create New" showBack backHref="/assignments">
        <Spinner />
      </AppLayout>
    );
  }

  if (!currentAssignment) {
    return (
      <AppLayout topbarTitle="Create New" showBack backHref="/assignments">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Assignment not found</p>
          <button type="button" onClick={() => router.push('/assignments')} className="veda-btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
            Back to Assignments
          </button>
        </div>
      </AppLayout>
    );
  }

  const processing = currentAssignment.status === 'processing' || currentAssignment.status === 'pending';
  const failed = currentAssignment.status === 'failed';
  const completed = currentAssignment.status === 'completed';

  return (
    <AppLayout topbarTitle="Create New" showBack backHref="/assignments">
      <MobilePageHeader title="Assignment Output" backHref="/assignments" />

      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: 'var(--veda-shadow-card)',
            border: '1px solid #f0f0f0',
          }}
        >
          {processing && (
            <div style={{ background: '#1a1a1a', padding: '20px 24px', color: 'white' }} className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>Generating your question paper...</p>
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{generationProgress?.message || 'AI is working on your assignment'}</p>
                  {generationProgress && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' }}>
                        <div className="progress-fill" style={{ height: '100%', background: 'white', borderRadius: 999, width: `${generationProgress.progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {failed && (
            <div style={{ padding: 24, background: '#fef2f2', borderBottom: '1px solid #fecaca' }} className="animate-fade-in">
              <p style={{ fontWeight: 600, color: '#991b1b', fontSize: 14, margin: '0 0 4px' }}>Generation Failed</p>
              <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 12px' }}>{currentAssignment.errorMessage || 'An error occurred'}</p>
              <button type="button" onClick={handleRegen} disabled={regen} className="veda-btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                {regen ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          )}

          {completed && currentAssignment.generatedPaper && (
            <>
              <div style={{ background: '#1a1a1a', padding: '22px 24px', color: 'white' }} className="animate-fade-in">
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                  Certainly, Lakshya! Here are customized Question Paper for your{' '}
                  <strong>CBSE {currentAssignment.className} {currentAssignment.subject}</strong> classes on the NCERT chapters:
                </p>
                <button
                  type="button"
                  onClick={handlePDF}
                  disabled={exporting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'white',
                    color: '#111827',
                    borderRadius: 999,
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: exporting ? 'wait' : 'pointer',
                    opacity: exporting ? 0.7 : 1,
                  }}
                >
                  {exporting ? (
                    <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #e5e7eb', borderTopColor: '#111827', borderRadius: '50%' }} />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                  Download as PDF
                </button>
              </div>

              <div className="animate-slide-up">
                <QuestionPaper paper={currentAssignment.generatedPaper} />
              </div>
            </>
          )}
        </div>

        {completed && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              type="button"
              onClick={handleRegen}
              disabled={regen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 13,
                color: '#374151',
                background: 'white',
              }}
            >
              {regen ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
