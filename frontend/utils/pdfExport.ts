import { GeneratedPaper } from '@/types';

// Sanitize text to remove characters that cause jsPDF font fallback to monospace
function sanitize(text: string): string {
  return text
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/©/g, '(c)')
    .replace(/®/g, '(R)')
    .replace(/™/g, '(TM)')
    .replace(/°/g, ' degrees')
    .replace(/±/g, '+/-')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/¹/g, '^1')
    .replace(/µ/g, 'u')
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/γ/g, 'gamma')
    .replace(/δ/g, 'delta')
    .replace(/π/g, 'pi')
    .replace(/Ω/g, 'Ohm')
    .replace(/ω/g, 'omega')
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/↑/g, '^')
    .replace(/↓/g, 'v')
    .replace(/≈/g, '~')
    .replace(/≠/g, '!=')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/∞/g, 'infinity')
    .replace(/√/g, 'sqrt')
    .replace(/∑/g, 'sum')
    .replace(/∫/g, 'integral')
    .replace(/∂/g, 'd')
    .replace(/∆/g, 'Delta')
    .replace(/•/g, '-')
    .replace(/·/g, '.')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/…/g, '...')
    .replace(/[^\x00-\x7F]/g, '?'); // replace any remaining non-ASCII
}

export const exportToPDF = async (paper: GeneratedPaper): Promise<void> => {
  const jsPDF = (await import('jspdf')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const ML = 18;
  const MR = 18;
  const rightEdge = pageW - MR;
  const fullW = pageW - ML - MR;
  // Reserve space on right for marks label
  const marksW = 24;
  const questionW = fullW - marksW - 4;
  let y = ML;

  const lh = (fs: number) => fs * 0.42;

  const checkPage = (need: number) => {
    if (y + need > pageH - ML) { doc.addPage(); y = ML; }
  };

  const set = (fs: number, style: 'normal' | 'bold' | 'italic' = 'normal', r = 0, g = 0, b = 0) => {
    doc.setFontSize(fs);
    doc.setFont('helvetica', style);
    doc.setTextColor(r, g, b);
  };

  // Add a full-width text block (no marks column)
  const addBlock = (text: string, fs: number, style: 'normal'|'bold'|'italic' = 'normal', align: 'left'|'center'|'right' = 'left', r=0,g=0,b=0, gap=2) => {
    const t = sanitize(text);
    set(fs, style, r, g, b);
    const lines = doc.splitTextToSize(t, fullW);
    const h = lines.length * lh(fs);
    checkPage(h + gap);
    if (align === 'center') doc.text(lines, pageW / 2, y, { align: 'center' });
    else if (align === 'right') doc.text(lines, rightEdge, y, { align: 'right' });
    else doc.text(lines, ML, y);
    y += h + gap;
  };

  // ── HEADER ──────────────────────────────────────────────────────────────────
  addBlock(paper.schoolName, 15, 'bold', 'center', 0,0,0, 2);
  addBlock(`Subject: ${paper.subject}`, 11, 'bold', 'center', 0,0,0, 1);
  addBlock(`Class: ${paper.className}`, 11, 'bold', 'center', 0,0,0, 4);

  doc.setDrawColor(180, 180, 180);
  doc.line(ML, y, rightEdge, y);
  y += 5;

  // ── META ────────────────────────────────────────────────────────────────────
  set(10, 'normal');
  doc.text(`Time Allowed: ${sanitize(paper.timeAllowed)}`, ML, y);
  doc.text(`Maximum Marks: ${paper.maximumMarks}`, rightEdge, y, { align: 'right' });
  y += 5;
  addBlock('All questions are compulsory unless stated otherwise.', 9, 'italic', 'left', 80,80,80, 5);

  // ── STUDENT INFO — blank lines only, no class value ──────────────────────────
  set(10, 'normal', 0,0,0);
  doc.text('Name:', ML, y);
  doc.line(ML + 14, y, ML + 90, y);
  y += 6;
  doc.text('Roll Number:', ML, y);
  doc.line(ML + 28, y, ML + 80, y);
  y += 6;
  doc.text('Section:', ML, y);
  doc.line(ML + 14, y, ML + 55, y);
  //doc.text('Section:', ML + 58, y);
  //doc.line(ML + 74, y, ML + 100, y);
  y += 6;

  // ── SECTIONS ─────────────────────────────────────────────────────────────────
  paper.sections.forEach((section) => {
    checkPage(24);

    addBlock(section.title, 12, 'bold', 'center', 0,0,0, 2);
    addBlock(section.questionType, 10, 'bold', 'left', 0,0,0, 1);
    addBlock(section.instruction, 9, 'italic', 'left', 90,90,90, 4);

    section.questions.forEach((q, idx) => {
      checkPage(20);

      const diffLabel = q.difficulty === 'easy' ? 'Easy' : q.difficulty === 'hard' ? 'Hard' : 'Moderate';
      const marksLabel = `[${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;

      // Parse question text and options
      const rawLines = q.text.split('\n').map(l => l.trim()).filter(Boolean);
      const firstOptIdx = rawLines.findIndex(l => /^[A-Da-d][).\s]/.test(l));
      const questionLine = sanitize(
        firstOptIdx > 0 ? rawLines.slice(0, firstOptIdx).join(' ') : rawLines.join(' ')
      );
      const options = firstOptIdx > 0 ? rawLines.slice(firstOptIdx).map(sanitize) : [];

      // Question prefix: "1. [Easy] Question text here"
      const qPrefix = `${idx + 1}. [${diffLabel}] `;
      const fullQText = qPrefix + questionLine;

      // Wrap question text within questionW (leaving marksW on right)
      set(10, 'normal', 0,0,0);
      const qLines = doc.splitTextToSize(fullQText, questionW);
      const qH = qLines.length * lh(10);
      checkPage(qH + 3);

      // Print question text on left
      doc.text(qLines, ML, y);

      // Print marks on RIGHT aligned to rightEdge, on same Y as question start
      set(10, 'bold', 0,0,0);
      doc.text(marksLabel, rightEdge, y, { align: 'right' });

      y += qH + 2;

      // MCQ Options — 2 per row
      if (options.length > 0) {
        set(10, 'normal', 0,0,0);
        const optIndent = ML + 5;
        const optColW = (fullW - 5) / 2;

        for (let i = 0; i < options.length; i += 2) {
          const leftOpt = options[i] || '';
          const rightOpt = options[i + 1] || '';

          const leftLines = doc.splitTextToSize(leftOpt, optColW - 3);
          const rightLines = rightOpt ? doc.splitTextToSize(rightOpt, optColW - 3) : [];
          const rowH = Math.max(leftLines.length, rightLines.length || 1) * lh(10);
          checkPage(rowH + 2);

          doc.text(leftLines, optIndent, y);
          if (rightLines.length > 0) {
            doc.text(rightLines, optIndent + optColW, y);
          }
          y += rowH + 1;
        }
      }

      y += 3;
    });

    y += 4;
  });

  // ── END OF PAPER ─────────────────────────────────────────────────────────────
  checkPage(10);
  addBlock('End of Question Paper', 10, 'bold', 'center', 0,0,0, 8);

  // ── ANSWER KEY ───────────────────────────────────────────────────────────────
  doc.setDrawColor(180, 180, 180);
  doc.line(ML, y, rightEdge, y);
  y += 6;
  addBlock('Answer Key:', 11, 'bold', 'left', 0,0,0, 4);

  paper.answerKey.forEach((ak, idx) => {
    checkPage(12);
    const ansText = sanitize(`${idx + 1}. ${ak.answer}`);
    set(9, 'normal', 60,60,60);
    const lines = doc.splitTextToSize(ansText, fullW);
    const h = lines.length * lh(9);
    checkPage(h + 3);
    doc.text(lines, ML, y);
    y += h + 3;
  });

  // ── FILENAME: "{Title} Question Paper.pdf" ───────────────────────────────────
  const titleClean = sanitize(paper.subject || 'Assignment')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
  doc.save(`${titleClean}_Question_Paper.pdf`);
};
