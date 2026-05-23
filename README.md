# VedaAI — AI Assessment Creator

An AI-powered question paper generator for teachers. Upload your content, configure question types and marks, and get a fully structured, exam-ready question paper in seconds — powered by GPT-4o-mini with real-time generation progress.

---

## What It Does

Teachers can:
- Create an assignment with subject, class, due date, and question configuration
- Upload a reference file (PDF / image) for context
- Define multiple question types (MCQ, Short, Long, Numerical, etc.) with custom counts and marks
- Watch the AI generate the paper in real time via WebSocket progress updates
- View a clean, structured question paper with sections, difficulty tags, and marks
- Download the paper as a formatted PDF
- Regenerate if the output isn't satisfactory

---

## Architecture Overview

```
┌─────────────────┐        HTTP / WebSocket        ┌──────────────────────────────┐
│   Next.js 16    │ ◄────────────────────────────► │  Node.js(Express) + Socket.io        │
│   (Frontend)    │                                 │   (Backend — Port 5000)      │
└─────────────────┘                                 └──────────┬───────────────────┘
                                                               │
                                              ┌────────────────┼────────────────┐
                                              ▼                ▼                ▼
                                          MongoDB           Redis           BullMQ
                                       (assignments)     (job state)     (job queue)
                                                                               │
                                                                               ▼
                                                                     Assessment Worker
                                                                               │
                                                                               ▼
                                                                      OpenAI GPT-4o-mini
```

**Request flow:**
1. Teacher submits the form → `POST /api/assignments`
2. Backend creates a MongoDB record and pushes a job to BullMQ
3. Worker picks up the job, calls OpenAI, and emits progress via Socket.io
4. Frontend receives real-time updates and navigates to the output page on completion
5. Generated paper is stored in MongoDB and rendered from structured data (never raw AI text)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| State Management | Zustand |
| Real-time | Socket.io client |
| PDF Export | jsPDF + html2canvas |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB (Mongoose) |
| Cache / Job State | Redis |
| Job Queue | BullMQ |
| AI | OpenAI GPT-4o-mini |
| Containerisation | Docker + Docker Compose |

---

## Project Structure

```
ai-assessment-creator/
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home / dashboard
│   │   ├── assignments/        # List, create, detail pages
│   │   ├── ai-toolkit/
│   │   ├── library/
│   │   └── settings/
│   ├── components/
│   │   ├── assignment/         # FileUpload, QuestionTypeRow, GenerationProgress
│   │   ├── layout/             # Sidebar, Topbar, MobileNav, AppLayout
│   │   └── output/             # QuestionPaper renderer
│   ├── store/                  # Zustand store (assignmentStore)
│   ├── hooks/                  # useSocket, useAssignmentSocket
│   ├── services/               # Axios API client
│   └── utils/                  # pdfExport
│
└── backend/
    └── src/
        ├── config/             # MongoDB + Redis connection
        ├── controllers/        # assignmentController
        ├── models/             # Assignment (Mongoose schema)
        ├── prompts/            # buildAssessmentPrompt
        ├── queues/             # assessmentQueue (BullMQ)
        ├── routes/             # assignmentRoutes
        ├── services/           # aiService (OpenAI + mock fallback)
        ├── socket/             # socketManager (Socket.io)
        └── workers/            # assessmentWorker (BullMQ processor)
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI
- Upstash Redis URL
- OpenAI API key *(optional — mock fallback works without it)*

---

### 1. Clone

```bash
git clone <your-repo-url>
cd ai-assessment-creator
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

`.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
REDIS_URL=your_upstash_redis_url
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=any_random_string
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

```bash
npm install
npm run dev
```

Runs at `http://localhost:5000`

---

### 3. Frontend

```bash
cd frontend
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

```bash
npm install
npm run dev
```

Runs at `http://localhost:3000`

---

## Key Features Implemented

### Assignment Creation
- Multi-field form with full validation (no empty fields, no negative values)
- Dynamic question type rows — add/remove sections, set count and marks per type
- File upload with drag-and-drop (PDF, image)
- Zustand store manages all form state and API interactions

### AI Generation Pipeline
- Structured prompt builder that maps question types to sections (A, B, C…)
- GPT-4o-mini called with `response_format: json_object` — no raw text ever rendered
- Response validated and transformed before saving to MongoDB
- Automatic time calculation based on total marks (1.5 min/mark)
- Difficulty spread: ~30% easy, ~50% medium, ~20% hard

### Real-time Progress
- BullMQ worker emits progress events at each stage (10% → 25% → 40% → 70% → 85% → 100%)
- Socket.io pushes updates to the specific client via room-based events
- Frontend shows an animated progress modal with step indicators

### Output Page
- Structured rendering from parsed data — sections, questions, difficulty badges, marks
- Student info section (name, roll number, class inputs)
- Answer key toggle
- Regenerate action

### PDF Export
- jsPDF + html2canvas captures the rendered paper
- Proper page breaks, school header, and formatting

### Mock Fallback
- When OpenAI quota is exceeded or key is missing, a built-in mock generator produces subject-aware questions for Science, Maths, English, Social Studies, and Computer Science
- Indistinguishable from real AI output in terms of structure

---

## API Reference

Base URL: `http://localhost:5000`

---

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Check if the server is running. Returns `{ status: "ok", timestamp, service }`. Use this to verify the backend is up before testing anything else. |

---

### Assignments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/assignments` | List all assignments. Supports `?search=`, `?status=`, `?page=`, `?limit=` query params. Results are cached in Redis for 30 seconds. |
| `POST` | `/api/assignments` | Create a new assignment and queue AI generation. Accepts `multipart/form-data` (file upload supported). Returns `assignmentId` to track progress. |
| `GET` | `/api/assignments/:id` | Get a single assignment with the full generated paper (sections, questions, answer key). |
| `GET` | `/api/assignments/:id/status` | Lightweight status poll — returns only `status`, `jobId`, `totalQuestions`, `totalMarks`. Use this to check generation state without fetching the full paper. |
| `DELETE` | `/api/assignments/:id` | Delete an assignment. Also invalidates the Redis list cache. |
| `POST` | `/api/assignments/:id/regenerate` | Re-queue AI generation for an existing assignment. Resets status to `pending` and runs the full generation pipeline again. |

---

### POST `/api/assignments` — Request body

Sent as `multipart/form-data`:

```
title                  string   required   e.g. "Quiz on Electricity"
subject                string   required   e.g. "Science"
className              string   required   e.g. "8th Grade"
dueDate                string   required   ISO date string
questionTypes          string   required   JSON stringified array (see below)
additionalInstructions string   optional   Extra instructions for the AI
file                   File     optional   PDF / image (max 10MB)
```

`questionTypes` format:
```json
[
  { "type": "Multiple Choice Questions", "count": 5, "marks": 1 },
  { "type": "Short Questions", "count": 3, "marks": 2 }
]
```

---

### POST `/api/assignments` — Response

```json
{
  "success": true,
  "data": {
    "assignmentId": "64f...",
    "jobId": "1",
    "status": "pending",
    "message": "Assignment created and queued for AI generation"
  }
}
```

---

### WebSocket Events

Connect to `http://localhost:5000` using Socket.io client.

**Join a room to receive updates for a specific assignment:**
```js
socket.emit('join-assignment', assignmentId)
```

**Listen for progress:**
```js
socket.on('assignment:progress', (data) => {
  // data.assignmentId  — which assignment
  // data.progress      — 0–100
  // data.message       — human-readable step label
  // data.status        — "processing" | "completed" | "failed"
})
```

Progress stages emitted: `10%` → `25%` → `40%` → `70%` → `85%` → `100%`

---

## Environment Variables

### Backend

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | — |
| `REDIS_URL` | Redis connection string | — |
| `OPENAI_API_KEY` | OpenAI API key | — (mock fallback used) |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |

### Frontend

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL |

---

## Approach

The core challenge was making AI output reliable and structured. Instead of asking the AI for free-form text and parsing it, the prompt explicitly defines the JSON schema the model must return, and `response_format: json_object` enforces it at the API level. The response is then validated and transformed server-side before anything touches the database — so the frontend always works with clean, typed data.

The background job architecture (BullMQ + Redis) means the API responds immediately while generation happens asynchronously. WebSocket rooms ensure progress updates only reach the client that triggered the job. This pattern scales naturally — you can run multiple workers in parallel just by increasing `concurrency`.

The mock fallback was built to be genuinely useful, not just a placeholder. It has real subject-specific question banks for the most common Indian school subjects, so the app is fully demonstrable without an OpenAI key.
