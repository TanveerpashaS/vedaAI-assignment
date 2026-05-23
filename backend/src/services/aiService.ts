import OpenAI from 'openai';
import { IGeneratedPaper, ISection, IQuestion } from '../models/Assignment';
import { AssessmentJobData } from '../queues/assessmentQueue';
import { buildAssessmentPrompt } from '../prompts/assessmentPrompt';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateAssessment = async (data: AssessmentJobData): Promise<IGeneratedPaper> => {
  const prompt = buildAssessmentPrompt(data);
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert educational assessment creator for Indian schools. Always respond with valid JSON only. No markdown, no code blocks, just raw JSON object.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });
    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) throw new Error('No content received from AI');
    const parsed = JSON.parse(rawContent);
    return validateAndTransformPaper(parsed, data);
  } catch (error: any) {
    if (error.code === 'insufficient_quota' || error.status === 429) {
      console.log('OpenAI quota exceeded, using mock data');
      return generateMockPaper(data);
    }
    if (error instanceof SyntaxError) throw new Error('AI returned invalid JSON response');
    throw error;
  }
};

const validateAndTransformPaper = (raw: any, data: AssessmentJobData): IGeneratedPaper => {
  const totalMarks = data.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);
  const sections: ISection[] = (raw.sections || []).map((section: any, idx: number) => {
    const questions: IQuestion[] = (section.questions || []).map((q: any, qIdx: number) => ({
      id: q.id || `q${idx + 1}-${qIdx + 1}`,
      text: q.text || q.question || 'Question text',
      difficulty: validateDifficulty(q.difficulty),
      marks: Number(q.marks) || 1,
      type: q.type || section.questionType || 'General',
      answerKey: q.answerKey || q.answer || '',
    }));
    return {
      id: section.id || `section-${String.fromCharCode(65 + idx).toLowerCase()}`,
      title: section.title || `Section ${String.fromCharCode(65 + idx)}`,
      instruction: section.instruction || `Attempt all questions. Each question carries ${questions[0]?.marks || 1} mark${(questions[0]?.marks || 1) > 1 ? 's' : ''}`,
      questionType: section.questionType || 'General',
      questions,
      totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    };
  });
  const answerKey = (raw.answerKey && raw.answerKey.length > 0)
    ? raw.answerKey.map((ak: any) => ({ questionId: ak.questionId || ak.id || '', answer: ak.answer || ak.answerKey || '' }))
    : sections.flatMap((section) => section.questions.filter((q) => q.answerKey).map((q) => ({ questionId: q.id, answer: q.answerKey as string })));
  return {
    schoolName: raw.schoolName || 'Delhi Public School, Sector-4, Bokaro',
    subject: raw.subject || data.subject,
    className: raw.className || data.className,
    timeAllowed: raw.timeAllowed || calculateTimeAllowed(totalMarks),
    maximumMarks: raw.maximumMarks || totalMarks,
    sections,
    answerKey,
    generatedAt: new Date(),
  };
};

const validateDifficulty = (d: string): 'easy' | 'medium' | 'hard' => {
  const n = (d || '').toLowerCase();
  if (n === 'easy') return 'easy';
  if (n === 'hard' || n === 'challenging' || n === 'difficult') return 'hard';
  return 'medium';
};

const calculateTimeAllowed = (totalMarks: number): string => {
  const minutes = Math.max(30, Math.ceil(totalMarks * 1.5));
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h} hour${h > 1 ? 's' : ''}` : `${h} hour${h > 1 ? 's' : ''} ${m} minutes`;
  }
  return `${minutes} minutes`;
};

interface SubjectData {
  mcq: Array<{ q: string; opts: string[]; ans: number; exp: string }>;
  short: Array<{ q: string; ans: string }>;
  long: Array<{ q: string; ans: string }>;
  numerical: Array<{ q: string; ans: string }>;
  fillBlanks: Array<{ q: string; ans: string }>;
  trueFalse: Array<{ q: string; ans: string }>;
}

const getSubjectData = (subject: string, className: string): SubjectData => {
  const s = subject.toLowerCase().trim();
  if (s.includes('science') || s.includes('physics') || s.includes('chemistry') || s.includes('biology')) return getScienceData();
  if (s.includes('math') || s.includes('maths') || s.includes('mathematics')) return getMathData();
  if (s.includes('english') || s.includes('language') || s.includes('grammar') || s.includes('literature')) return getEnglishData();
  if (s.includes('history') || s.includes('social') || s.includes('civics') || s.includes('geography') || s.includes('sst')) return getSocialData();
  if (s.includes('computer') || s.includes('it') || s.includes('information') || s.includes('coding')) return getComputerData();
  return getDynamicSubjectData(subject, className);
};

function getScienceData(): SubjectData {
  return {
    mcq: [
      { q: 'Which of the following is a conductor of electricity?', opts: ['Wood', 'Rubber', 'Copper', 'Plastic'], ans: 2, exp: 'C) Copper — Copper is a metal and metals are good conductors of electricity due to free electrons.' },
      { q: 'What is the chemical formula of water?', opts: ['H2O2', 'H2O', 'HO2', 'H3O'], ans: 1, exp: 'B) H2O — Water consists of 2 hydrogen atoms and 1 oxygen atom.' },
      { q: 'Which gas is produced during photosynthesis?', opts: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'], ans: 2, exp: 'C) Oxygen — Plants release oxygen as a byproduct of photosynthesis.' },
      { q: 'What is the unit of electric current?', opts: ['Volt', 'Watt', 'Ampere', 'Ohm'], ans: 2, exp: 'C) Ampere — Electric current is measured in Amperes (A).' },
      { q: 'Which planet is known as the Red Planet?', opts: ['Venus', 'Jupiter', 'Saturn', 'Mars'], ans: 3, exp: 'D) Mars — Mars appears red due to iron oxide on its surface.' },
      { q: 'What is the process by which plants make food?', opts: ['Respiration', 'Photosynthesis', 'Digestion', 'Transpiration'], ans: 1, exp: 'B) Photosynthesis — Plants use sunlight, water, and CO2 to produce glucose.' },
      { q: 'Which organ pumps blood in the human body?', opts: ['Lungs', 'Liver', 'Heart', 'Kidney'], ans: 2, exp: 'C) Heart — The heart is a muscular organ that pumps blood throughout the body.' },
      { q: 'What is the SI unit of force?', opts: ['Joule', 'Watt', 'Newton', 'Pascal'], ans: 2, exp: 'C) Newton — Force is measured in Newtons (N) in the SI system.' },
    ],
    short: [
      { q: 'Define electric current and state its SI unit.', ans: 'Electric current is the rate of flow of electric charge through a conductor. Its SI unit is Ampere (A). Mathematically, I = Q/t.' },
      { q: 'What is the difference between conductor and insulator? Give one example of each.', ans: 'A conductor allows electricity to flow (e.g., copper). An insulator does not allow electricity to flow (e.g., rubber).' },
      { q: 'Explain the process of photosynthesis with a chemical equation.', ans: 'Photosynthesis: 6CO2 + 6H2O + sunlight → C6H12O6 + 6O2. It occurs in chloroplasts using chlorophyll.' },
      { q: "State Newton's First Law of Motion.", ans: "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force. This is the Law of Inertia." },
    ],
    long: [
      { q: 'Explain the water cycle with all four stages.', ans: 'The water cycle: (1) Evaporation — water evaporates from oceans. (2) Condensation — water vapour forms clouds. (3) Precipitation — water falls as rain or snow. (4) Collection — water collects in rivers and oceans.' },
      { q: 'Describe the structure and function of the human heart.', ans: 'The heart has 4 chambers — 2 atria and 2 ventricles. Right side pumps deoxygenated blood to lungs; left side pumps oxygenated blood to body. It beats ~72 times per minute.' },
    ],
    numerical: [
      { q: "A current of 2A flows through a resistor of 5 Ohm. Calculate the voltage using Ohm's Law.", ans: "V = I x R = 2 x 5 = 10 Volts" },
      { q: 'An object travels 150 metres in 30 seconds. Calculate its speed.', ans: 'Speed = Distance / Time = 150 / 30 = 5 m/s' },
    ],
    fillBlanks: [
      { q: 'The process by which water changes from liquid to gas is called ________.', ans: 'Evaporation' },
      { q: 'The SI unit of force is ________.', ans: 'Newton (N)' },
    ],
    trueFalse: [
      { q: 'Sound travels faster in air than in water. (True/False)', ans: 'False — Sound travels faster in water (1480 m/s) than in air (343 m/s).' },
      { q: 'The Earth revolves around the Sun. (True/False)', ans: 'True — The Earth takes approximately 365.25 days to complete one revolution.' },
    ],
  };
}

function getMathData(): SubjectData {
  return {
    mcq: [
      { q: 'What is the value of pi approximately?', opts: ['3.14', '3.41', '3.12', '3.16'], ans: 0, exp: 'A) 3.14 — Pi is approximately 3.14159...' },
      { q: 'What is the square root of 144?', opts: ['11', '12', '13', '14'], ans: 1, exp: 'B) 12 — 12 x 12 = 144.' },
      { q: 'Which of the following is a prime number?', opts: ['9', '15', '17', '21'], ans: 2, exp: 'C) 17 — 17 is divisible only by 1 and itself.' },
      { q: 'What is 15% of 200?', opts: ['25', '30', '35', '40'], ans: 1, exp: 'B) 30 — 15/100 x 200 = 30.' },
      { q: 'The sum of angles in a triangle is:', opts: ['90 degrees', '180 degrees', '270 degrees', '360 degrees'], ans: 1, exp: 'B) 180 degrees — Sum of interior angles of any triangle is 180 degrees.' },
      { q: 'What is the LCM of 4 and 6?', opts: ['8', '10', '12', '24'], ans: 2, exp: 'C) 12 — LCM(4,6) = 12.' },
    ],
    short: [
      { q: 'Find the area of a rectangle with length 8 cm and breadth 5 cm.', ans: 'Area = length x breadth = 8 x 5 = 40 sq cm' },
      { q: 'Solve: 3x + 7 = 22. Find x.', ans: '3x = 22 - 7 = 15, so x = 5' },
    ],
    long: [
      { q: 'Prove that the sum of angles in a triangle is 180 degrees.', ans: 'Draw triangle ABC. Draw PQ parallel to BC through A. Angle PAB = Angle ABC (alternate angles). Angle QAC = Angle ACB (alternate angles). PAB + BAC + QAC = 180 degrees (straight line). Therefore ABC + BAC + ACB = 180 degrees.' },
    ],
    numerical: [
      { q: 'A train travels at 60 km/h. How far will it travel in 2.5 hours?', ans: 'Distance = Speed x Time = 60 x 2.5 = 150 km' },
      { q: 'Find the simple interest on Rs 1000 at 5% per annum for 2 years.', ans: 'SI = (P x R x T) / 100 = (1000 x 5 x 2) / 100 = Rs 100' },
    ],
    fillBlanks: [
      { q: 'The perimeter of a square with side 6 cm is ________.', ans: '24 cm' },
      { q: 'The value of 2 cubed is ________.', ans: '8' },
    ],
    trueFalse: [
      { q: 'A square is a special type of rectangle. (True/False)', ans: 'True — A square has all properties of a rectangle plus all sides are equal.' },
    ],
  };
}

function getEnglishData(): SubjectData {
  return {
    mcq: [
      { q: 'Which of the following is a noun?', opts: ['Run', 'Beautiful', 'Happiness', 'Quickly'], ans: 2, exp: 'C) Happiness — It is an abstract noun naming a feeling.' },
      { q: 'Choose the correct form: She ________ to school every day.', opts: ['go', 'goes', 'going', 'gone'], ans: 1, exp: 'B) goes — Third person singular takes -s in simple present.' },
      { q: 'What is the plural of "child"?', opts: ['Childs', 'Childes', 'Children', 'Childrens'], ans: 2, exp: 'C) Children — Irregular plural form.' },
      { q: 'Which is in passive voice?', opts: ['She wrote a letter.', 'A letter was written by her.', 'She is writing.', 'She will write.'], ans: 1, exp: 'B) A letter was written by her — Subject receives the action.' },
    ],
    short: [
      { q: 'Write 5 sentences about your favourite season.', ans: 'My favourite season is winter. The cool breeze makes it enjoyable. I love wearing warm clothes. Winter mornings are foggy and beautiful. This season brings festivals like Christmas.' },
      { q: 'Explain the difference between a simile and a metaphor with examples.', ans: 'Simile uses "like" or "as" (e.g., brave as a lion). Metaphor directly states one thing is another (e.g., she is a lion). Both are figures of speech.' },
    ],
    long: [
      { q: 'Write a letter to your principal requesting permission to organise a science exhibition.', ans: 'To, The Principal, [School]. Subject: Permission for Science Exhibition. Respected Sir/Madam, I request permission to organise a Science Exhibition on [date]. It will showcase student projects. Thankfully yours, [Name].' },
    ],
    numerical: [],
    fillBlanks: [
      { q: 'The opposite of "ancient" is ________.', ans: 'Modern' },
      { q: 'A word that describes a noun is called an ________.', ans: 'Adjective' },
    ],
    trueFalse: [
      { q: '"Quickly" is an adjective. (True/False)', ans: 'False — "Quickly" is an adverb as it modifies a verb.' },
    ],
  };
}

function getSocialData(): SubjectData {
  return {
    mcq: [
      { q: 'Who was the first Prime Minister of India?', opts: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'B.R. Ambedkar'], ans: 1, exp: "B) Jawaharlal Nehru — He served as India's first Prime Minister from 1947 to 1964." },
      { q: 'In which year did India gain independence?', opts: ['1945', '1946', '1947', '1948'], ans: 2, exp: 'C) 1947 — India gained independence on 15 August 1947.' },
      { q: 'Which is the largest continent?', opts: ['Africa', 'North America', 'Asia', 'Europe'], ans: 2, exp: 'C) Asia — Asia is the largest continent.' },
      { q: 'The Constitution of India came into effect on:', opts: ['15 Aug 1947', '26 Jan 1950', '26 Nov 1949', '2 Oct 1869'], ans: 1, exp: 'B) 26 Jan 1950 — The Constitution of India came into effect on 26 January 1950.' },
    ],
    short: [
      { q: 'What is democracy? Name two features of democracy.', ans: 'Democracy is a system where people elect their representatives. Features: (1) Free and fair elections, (2) Rule of law and equality before law.' },
      { q: 'What were the main causes of the French Revolution?', ans: 'Main causes: (1) Social inequality, (2) Economic crisis and heavy taxation, (3) Absolute monarchy with no representation, (4) Influence of Enlightenment ideas.' },
    ],
    long: [
      { q: 'Describe the major physical features of India.', ans: 'India has: (1) Himalayan Mountains in the north. (2) Northern Plains — fertile, formed by Ganga and Yamuna. (3) Peninsular Plateau — Deccan Plateau, rich in minerals. (4) Coastal Plains — Eastern and Western Ghats. (5) Islands — Andaman and Nicobar, Lakshadweep.' },
    ],
    numerical: [
      { q: 'If a country has population 1.4 billion and area 3.3 million sq km, calculate population density.', ans: 'Population Density = Population / Area = 1,400,000,000 / 3,300,000 = approximately 424 persons per sq km.' },
    ],
    fillBlanks: [
      { q: 'The capital of India is ________.', ans: 'New Delhi' },
      { q: 'The Constitution of India came into effect on ________.', ans: '26 January 1950' },
    ],
    trueFalse: [
      { q: 'The Rajya Sabha is the lower house of Indian Parliament. (True/False)', ans: 'False — Rajya Sabha is the upper house. Lok Sabha is the lower house.' },
    ],
  };
}

function getComputerData(): SubjectData {
  return {
    mcq: [
      { q: 'What does CPU stand for?', opts: ['Central Processing Unit', 'Computer Processing Unit', 'Central Program Unit', 'Core Processing Unit'], ans: 0, exp: 'A) Central Processing Unit — The CPU processes all instructions.' },
      { q: 'Which of the following is an input device?', opts: ['Monitor', 'Printer', 'Keyboard', 'Speaker'], ans: 2, exp: 'C) Keyboard — A keyboard is used to input data into the computer.' },
      { q: 'What is the full form of RAM?', opts: ['Read Access Memory', 'Random Access Memory', 'Rapid Access Memory', 'Read And Memory'], ans: 1, exp: 'B) Random Access Memory — RAM is temporary memory used by the CPU.' },
      { q: 'Which language is used for web pages?', opts: ['C++', 'Java', 'HTML', 'Python'], ans: 2, exp: 'C) HTML — HyperText Markup Language is used to create web pages.' },
    ],
    short: [
      { q: 'What is the difference between hardware and software? Give examples.', ans: 'Hardware is physical components (e.g., keyboard, monitor). Software is programs and instructions (e.g., Windows, MS Word). Hardware is tangible; software is intangible.' },
      { q: 'What is an operating system? Name two examples.', ans: 'An OS manages computer hardware and software resources. Examples: Windows 11, macOS, Linux, Android.' },
    ],
    long: [
      { q: 'Explain the generations of computers with their key features.', ans: '1st Gen (1940s-50s): Vacuum tubes, ENIAC. 2nd Gen (1950s-60s): Transistors, smaller. 3rd Gen (1960s-70s): Integrated circuits. 4th Gen (1970s-present): Microprocessors, personal computers. 5th Gen: AI and parallel processing.' },
    ],
    numerical: [
      { q: 'Convert the binary number 1010 to decimal.', ans: '1010 = 1x8 + 0x4 + 1x2 + 0x1 = 8 + 0 + 2 + 0 = 10 in decimal.' },
    ],
    fillBlanks: [
      { q: 'The full form of URL is ________.', ans: 'Uniform Resource Locator' },
      { q: '1 Kilobyte = ________ bytes.', ans: '1024 bytes' },
    ],
    trueFalse: [
      { q: 'A compiler translates the entire program at once. (True/False)', ans: 'True — A compiler translates the entire source code into machine code at once.' },
    ],
  };
}

function getDynamicSubjectData(subject: string, className: string): SubjectData {
  return {
    mcq: [
      { q: `Which of the following is a fundamental concept in ${subject}?`, opts: ['Theoretical framework', 'Practical application', 'Historical context', 'All of the above'], ans: 3, exp: `D) All of the above — ${subject} involves theoretical frameworks, practical applications, and historical context.` },
      { q: `What is the primary objective of studying ${subject}?`, opts: ['Memorise facts only', 'Understand and apply concepts', 'Pass examinations', 'Learn definitions'], ans: 1, exp: `B) Understand and apply concepts — The goal of ${subject} is to develop understanding and problem-solving ability.` },
      { q: `Which approach is most effective for learning ${subject}?`, opts: ['Rote learning', 'Critical thinking and practice', 'Copying notes', 'Reading once'], ans: 1, exp: `B) Critical thinking and practice — Active engagement leads to better understanding of ${subject}.` },
    ],
    short: [
      { q: `Define the key concepts of ${subject} and explain their importance for ${className} students.`, ans: `${subject} involves fundamental principles that help students understand the world. Key concepts include systematic analysis, logical reasoning, and practical application.` },
      { q: `How is ${subject} relevant to everyday life? Give two examples.`, ans: `${subject} is relevant in many ways. Example 1: It helps develop analytical thinking. Example 2: It provides knowledge applicable to real-world problems and career opportunities.` },
    ],
    long: [
      { q: `Discuss the importance of ${subject} in the modern world and its applications in various fields.`, ans: `${subject} plays a crucial role in education, industry, and research. Students who master ${subject} develop critical thinking, problem-solving, and analytical skills valuable across all fields.` },
    ],
    numerical: [
      { q: `A student scores 72 out of 90 in ${subject}. What is the percentage?`, ans: `Percentage = (72/90) x 100 = 80%. The student has performed well in ${subject}.` },
    ],
    fillBlanks: [
      { q: `The study of ${subject} helps develop ________ and ________ skills.`, ans: 'Analytical and critical thinking' },
    ],
    trueFalse: [
      { q: `${subject} has no practical applications in real life. (True/False)`, ans: `False — ${subject} has many practical applications in real life, industry, and research.` },
    ],
  };
}

export const generateMockPaper = (data: AssessmentJobData): IGeneratedPaper => {
  const totalMarks = data.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);
  const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard', 'easy', 'medium', 'medium', 'hard', 'easy'];
  const subjectData = getSubjectData(data.subject, data.className);

  const sections: ISection[] = data.questionTypes.map((qt, idx) => {
    const qType = qt.type.toLowerCase();
    const isMCQ = qType.includes('multiple choice') || qType.includes('mcq');
    const isLong = qType.includes('long') || qType.includes('essay');
    const isNumerical = qType.includes('numerical') || qType.includes('problem') || qType.includes('calculation');
    const isFill = qType.includes('fill') || qType.includes('blank');
    const isTF = qType.includes('true') || qType.includes('false');

    const questions: IQuestion[] = Array.from({ length: qt.count }, (_, qIdx) => {
      const diff = difficulties[qIdx % difficulties.length];
      let text = '';
      let answerKey = '';

      if (isMCQ && subjectData.mcq.length > 0) {
        const item = subjectData.mcq[qIdx % subjectData.mcq.length];
        text = `${item.q}\nA) ${item.opts[0]}\nB) ${item.opts[1]}\nC) ${item.opts[2]}\nD) ${item.opts[3]}`;
        answerKey = item.exp;
      } else if (isNumerical && subjectData.numerical.length > 0) {
        const item = subjectData.numerical[qIdx % subjectData.numerical.length];
        text = item.q; answerKey = item.ans;
      } else if (isFill && subjectData.fillBlanks.length > 0) {
        const item = subjectData.fillBlanks[qIdx % subjectData.fillBlanks.length];
        text = item.q; answerKey = item.ans;
      } else if (isTF && subjectData.trueFalse.length > 0) {
        const item = subjectData.trueFalse[qIdx % subjectData.trueFalse.length];
        text = item.q; answerKey = item.ans;
      } else if (isLong && subjectData.long.length > 0) {
        const item = subjectData.long[qIdx % subjectData.long.length];
        text = item.q; answerKey = item.ans;
      } else if (subjectData.short.length > 0) {
        const item = subjectData.short[qIdx % subjectData.short.length];
        text = item.q; answerKey = item.ans;
      } else {
        text = `Question ${qIdx + 1}: Explain a key concept of ${data.subject}.`;
        answerKey = `Students should demonstrate understanding of ${data.subject} concepts with relevant examples.`;
      }

      return { id: `q${idx + 1}-${qIdx + 1}`, text, difficulty: diff, marks: qt.marks, type: qt.type, answerKey };
    });

    return {
      id: `section-${sectionLetters[idx].toLowerCase()}`,
      title: `Section ${sectionLetters[idx]}`,
      instruction: `Attempt all questions. Each question carries ${qt.marks} mark${qt.marks > 1 ? 's' : ''}`,
      questionType: qt.type,
      questions,
      totalMarks: qt.count * qt.marks,
    };
  });

  const answerKey = sections.flatMap((section) =>
    section.questions.map((q) => ({ questionId: q.id, answer: q.answerKey || 'Answer not available' }))
  );

  return {
    schoolName: 'Delhi Public School, Sector-4, Bokaro',
    subject: data.subject,
    className: data.className,
    timeAllowed: calculateTimeAllowed(totalMarks),
    maximumMarks: totalMarks,
    sections,
    answerKey,
    generatedAt: new Date(),
  };
};
