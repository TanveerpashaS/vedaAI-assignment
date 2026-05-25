'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import MobilePageHeader from '@/components/layout/MobilePageHeader';
import FileUpload from '@/components/assignment/FileUpload';
import QuestionTypeRow from '@/components/assignment/QuestionTypeRow';
import GenerationProgressUI from '@/components/assignment/GenerationProgress';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useAssignmentSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const {
    formData, isCreating, isGenerating, generationProgress,
    createAssignment, addQuestionType, removeQuestionType,
    updateQuestionType, updateFormData, resetForm, resetGenerationState,
  } = useAssignmentStore();

  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dateRef = useRef<HTMLInputElement>(null);

  useAssignmentSocket(assignmentId);

  // Reset stale generation state when entering create page
  useEffect(() => {
    resetGenerationState();
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for status as fallback when WebSocket doesn't deliver events
  useEffect(() => {
    if (!assignmentId || !isGenerating) return;

    const ts = () => new Date().toISOString();

    const poll = setInterval(async () => {
      try {
        const { assignmentApi } = await import('@/services/api');
        const res = await assignmentApi.getById(assignmentId);
        if (res.success && res.data) {
          const status = res.data.status;
          if (status === 'completed') {
            const { setGenerationProgress, updateAssignmentStatus } = useAssignmentStore.getState();
            setGenerationProgress({ assignmentId, progress: 100, message: 'Question paper ready!', status: 'completed', timestamp: ts() });
            updateAssignmentStatus(assignmentId, 'completed', res.data.generatedPaper);
            clearInterval(poll);
          } else if (status === 'failed') {
            const { setGenerationProgress, updateAssignmentStatus } = useAssignmentStore.getState();
            setGenerationProgress({ assignmentId, progress: 0, message: 'Generation failed', status: 'failed', timestamp: ts() });
            updateAssignmentStatus(assignmentId, 'failed');
            clearInterval(poll);
          } else if (status === 'processing') {
            const { setGenerationProgress } = useAssignmentStore.getState();
            setGenerationProgress({ assignmentId, progress: 50, message: 'Generating questions...', status: 'processing', timestamp: ts() });
          }
        }
      } catch {}
    }, 3000);

    return () => clearInterval(poll);
  }, [assignmentId, isGenerating]);

  // Show progress modal immediately when generation starts
  useEffect(() => {
    if (isGenerating && assignmentId && !generationProgress) {
      const { setGenerationProgress } = useAssignmentStore.getState();
      setGenerationProgress({ assignmentId, progress: 10, message: 'Starting AI generation...', status: 'processing', timestamp: new Date().toISOString() });
    }
  }, [isGenerating, assignmentId, generationProgress]);

  // Auto-navigate to output when generation completes
  useEffect(() => {
    if (generationProgress?.status === 'completed' && assignmentId) {
      setTimeout(() => router.push(`/assignments/${assignmentId}`), 1500);
    }
  }, [generationProgress, assignmentId, router]);

  const totalQ = formData.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalM = formData.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!subject.trim()) e.subject = 'Subject is required';
    if (!className.trim()) e.className = 'Class is required';
    if (!dueDate) e.dueDate = 'Due date is required';
    if (!formData.questionTypes.length) e.qt = 'Add at least one question type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const id = await createAssignment({
      title: title.trim(),
      subject: subject.trim(),
      className: className.trim(),
      dueDate,
      questionTypes: formData.questionTypes,
      additionalInstructions: formData.additionalInstructions || '',
      file,
    });
    if (id) {
      setAssignmentId(id);
      // Don't show toast — the generation modal already shows progress
    } else {
      toast.error('Failed to create assignment');
    }
  };

  // Shared input style
  const inp = (hasErr?: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 14px',
    border: `1px solid ${hasErr ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: 12, fontSize: 13, background: 'white',
    outline: 'none', boxSizing: 'border-box', color: '#111827',
  });

  const Err = ({ k }: { k: string }) =>
    errors[k] ? <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>{errors[k]}</p> : null;

  const GreenDot = () => (
    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
  );

  const FORM_MAX = 780;

  const centeredColumn: React.CSSProperties = {
    maxWidth: FORM_MAX,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
  };

  const formCard: React.CSSProperties = {
    background: '#ebebeb',
    borderRadius: 24,
    padding: '26px 28px 28px',
    marginBottom: 20,
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
  };

  return (
    <AppLayout topbarTitle="Assignment" showBack backHref="/assignments">
      <MobilePageHeader title="Create Assignment" backHref="/assignments" />

      <div style={{ padding: '24px 28px 32px' }}>

        {/* Page header — left aligned (design) */}
        <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <GreenDot />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.25 }}>Create Assignment</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Set up a new assignment for your students.</p>
          </div>
        </div>

        {/* Progress bar + form — shared centered width */}
        <div style={centeredColumn}>
          <div
            style={{
              height: 4,
              background: '#e0e0e0',
              borderRadius: 999,
              margin: '14px 0 22px',
              overflow: 'hidden',
              width: '100%',
            }}
          >
            <div style={{ height: '100%', width: '50%', background: '#1a1a1a', borderRadius: 999 }} />
          </div>

        <form onSubmit={handleSubmit}>
          <div style={formCard}>
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Assignment Details</h2>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Basic information about your assignment</p>
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: 20 }}>
              <FileUpload value={file} onChange={setFile} />
            </div>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Assignment Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Quiz on Electricity"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={inp(!!errors.title)}
              />
              <Err k="title" />
            </div>

            {/* Subject + Class */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Subject <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="text" placeholder="e.g. Science" value={subject} onChange={e => setSubject(e.target.value)} style={inp(!!errors.subject)} />
                <Err k="subject" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Class <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="text" placeholder="e.g. 8th Grade" value={className} onChange={e => setClassName(e.target.value)} style={inp(!!errors.className)} />
                <Err k="className" />
              </div>
            </div>

            {/* Due Date — native date picker, single calendar icon */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Due Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                ref={dateRef}
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ ...inp(!!errors.dueDate), cursor: 'pointer', colorScheme: 'light' as const }}
              />
              <Err k="dueDate" />
            </div>

            {/* Question Types */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 12px' }}>Question Type</h3>

              <div className="hidden md:grid" style={{ gridTemplateColumns: '1fr 28px 110px 110px', gap: 10, fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>
                <span>Question Type</span>
                <span />
                <span style={{ textAlign: 'center' }}>No. of Questions</span>
                <span style={{ textAlign: 'center' }}>Marks</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {formData.questionTypes.map((qt) => (
                  <div key={qt.id}>
                    <div className="hidden md:block">
                      <QuestionTypeRow
                        questionType={qt}
                        onUpdate={(f, v) => updateQuestionType(qt.id, f, v)}
                        onRemove={() => removeQuestionType(qt.id)}
                        canRemove={formData.questionTypes.length > 1}
                      />
                    </div>
                    <div className="md:hidden">
                      <QuestionTypeRow
                        questionType={qt}
                        onUpdate={(f, v) => updateQuestionType(qt.id, f, v)}
                        onRemove={() => removeQuestionType(qt.id)}
                        canRemove={formData.questionTypes.length > 1}
                        mobile
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestionType}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 13, color: '#374151', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <span style={{ width: 28, height: 28, background: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </span>
                Add Question Type
              </button>

              {errors.qt && <p style={{ fontSize: 11, color: '#ef4444', margin: '8px 0 0' }}>{errors.qt}</p>}

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 28, fontSize: 13, color: '#6b7280' }}>
                <span>Total Questions : <strong style={{ color: '#111827' }}>{totalQ}</strong></span>
                <span>Total Marks : <strong style={{ color: '#111827' }}>{totalM}</strong></span>
              </div>
            </div>

            {/* Additional Instructions */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Additional Information (For better output)
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={formData.additionalInstructions}
                  onChange={e => updateFormData({ additionalInstructions: e.target.value })}
                  placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                  rows={4}
                  style={{ width: '100%', padding: '12px 40px 12px 14px', border: '1.5px dashed #d1d5db', borderRadius: 14, fontSize: 13, background: 'white', resize: 'none', outline: 'none', boxSizing: 'border-box', color: '#111827' }}
                />
                <button type="button" style={{ position: 'absolute', right: 12, bottom: 12, padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <button
              type="button"
              onClick={() => { resetForm(); router.push('/assignments'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', border: '1px solid #d1d5db', borderRadius: 999, fontSize: 13, fontWeight: 600, color: '#374151', background: 'white', cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Previous
            </button>

            <button
              type="submit"
              disabled={isCreating || isGenerating}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: isCreating || isGenerating ? 'not-allowed' : 'pointer', opacity: isCreating || isGenerating ? 0.6 : 1, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
            >
              {isCreating ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Next
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>

      <GenerationProgressUI
        progress={generationProgress}
        isVisible={isGenerating || generationProgress?.status === 'completed'}
      />
    </AppLayout>
  );
}
