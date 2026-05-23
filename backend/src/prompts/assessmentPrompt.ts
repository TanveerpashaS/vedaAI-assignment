import { AssessmentJobData } from '../queues/assessmentQueue';

/** Calculate time based on total marks: 1.5 min/mark, min 30 min */
export const calcTime = (totalMarks: number): string => {
  const minutes = Math.max(30, Math.ceil(totalMarks * 1.5));
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0
      ? `${h} hour${h > 1 ? 's' : ''}`
      : `${h} hour${h > 1 ? 's' : ''} ${m} minutes`;
  }
  return `${minutes} minutes`;
};

export const buildAssessmentPrompt = (data: AssessmentJobData): string => {
  const totalQuestions = data.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = data.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);
  const timeAllowed = calcTime(totalMarks);

  const breakdown = data.questionTypes
    .map((qt, i) => {
      const section = String.fromCharCode(65 + i); // A, B, C...
      return `Section ${section}: ${qt.type} — ${qt.count} questions × ${qt.marks} mark${qt.marks > 1 ? 's' : ''} each`;
    })
    .join('\n');

  return `You are an expert Indian school teacher creating a question paper.

PAPER DETAILS:
- Assignment Title: ${data.title}
- Subject: ${data.subject}
- Class: ${data.className}
- Total Questions: ${totalQuestions}
- Total Marks: ${totalMarks}
- Time Allowed: ${timeAllowed}

SECTIONS:
${breakdown}

${data.additionalInstructions?.trim()
  ? `TEACHER'S SPECIAL INSTRUCTIONS (follow these exactly):
${data.additionalInstructions.trim()}

`
  : ''}RULES:
1. Every question MUST be about "${data.subject}" for class "${data.className}" — no other subject
2. For Multiple Choice Questions: put 4 options on separate lines starting with A) B) C) D)
3. Difficulty: use exactly "easy", "medium", or "hard" (lowercase)
4. Spread difficulty: ~30% easy, ~50% medium, ~20% hard
5. Answer key must be specific and correct — not generic text
6. MCQ answers: state correct letter + brief reason (e.g. "C) Copper — metals conduct electricity")
7. Time allowed is fixed: ${timeAllowed}
8. Follow teacher's special instructions if provided above

OUTPUT: Valid JSON only, no markdown, no explanation.

{
  "schoolName": "Delhi Public School, Sector-4, Bokaro",
  "subject": "${data.subject}",
  "className": "${data.className}",
  "timeAllowed": "${timeAllowed}",
  "maximumMarks": ${totalMarks},
  "sections": [
    {
      "id": "section-a",
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries X marks",
      "questionType": "TYPE_NAME",
      "questions": [
        {
          "id": "q1",
          "text": "Question text here?\\nA) Option 1\\nB) Option 2\\nC) Option 3\\nD) Option 4",
          "difficulty": "easy",
          "marks": 1,
          "type": "TYPE_NAME",
          "answerKey": "B) Option 2 — reason here"
        }
      ],
      "totalMarks": 5
    }
  ],
  "answerKey": [
    { "questionId": "q1", "answer": "Specific correct answer" }
  ]
}`;
};
