# EduCore Hackathon Requirements

This document captures the exact requirements and constraints for building the EduCore application based on the Stitch UI designs and CollabCore codebase.

## Objective
Using the existing EduCore UI designs already generated in the Stitch project as the visual reference — replicate the exact same design system, color palette, typography, component styles, and layout patterns across all pages. Do not redesign anything. 
Match the dark theme (#0A0D14 background, cyan #00D4FF + violet #7C3AED accents, glassmorphism cards, same sidebar, same navbar, same tab bar, same button styles) exactly as shown.

---

## What to Build as Real (Fully Functional)

### 1. Authentication
- Firebase Auth with email + password
- Role selection on register: Teacher or Student
- Role stored as custom claim in Firebase token
- Entire app routes differently based on role
- Login page exactly as designed (role toggle cards, "Initialize Core" button, Google OAuth)

### 2. Teacher — Subject Management
- Teacher can create a subject (name, department, term)
- System auto-generates a 6-digit join code per subject
- Teacher sees all their subjects as cards (exactly as designed — subject name, student count, join code with copy button, last activity, View Progress + Open Workspace buttons)
- Teacher can open any subject's workspace

### 3. Student — Home Dashboard
- Student can enter a join code and enroll in a class
- Student sees "My Class Groups" section with enrolled subjects as cards (subject name, teacher name, completion ring, Open Workspace button)
- Student can create a Hackathon Group (name, description)
- Student sees "My Hackathon Groups" section with their groups as cards (project name, member avatars, Open Workspace button)
- Bottom stat bar: Tasks Due, Active Streak, Meetings, Commits — show real numbers where available, static/fake for others

### 4. Group Workspace — Overview Tab
- Works for both class groups and hackathon groups
- Shows team members list with online status (fake online, real member list)
- Pinned announcement card (teacher can post for class groups, owner can post for hackathon groups)
- Recent activity feed (task completions, file uploads, commits — pulled from Firestore)
- Quick action buttons: New Task, Upload File, Schedule Meeting (these open their respective tabs)
- Right panel: overall progress ring (calculated from tasks done/total), milestone stepper (static/fake stages), Next meeting card (real if scheduled), GitHub repo card (real if connected)

### 5. Group Workspace — Task Board (Kanban)
- 4 columns: Backlog, To Do, In Progress, Done
- Create tasks with title, assignee (team member), priority (High/Medium/Low), due date
- Move tasks between columns (drag and drop OR click to change status)
- Task count badge on each column header
- Task card shows: title, assignee avatar, priority pill, due date
- Click task to open side panel with full details (description, assignee, priority, due date, simple comments)
- All stored in Firestore, real-time updates via onSnapshot listener

### 6. Group Workspace — Chat
- Real-time group chat using Firestore onSnapshot
- Messages show sender avatar, name, timestamp
- Own messages right-aligned (violet bubble), others left-aligned (dark glass bubble)
- File attachment display (show filename card inline, actual file upload via Cloudinary or Firebase Storage)
- Teacher viewing a class group chat sees amber banner "You are viewing as teacher — read only mode" and cannot send messages
- Typing indicator (fake animation is fine)
- Members list in left sidebar with online dots (fake)
- Pinned messages section (static, hardcoded is fine)

### 7. Firebase Backend (Firestore Collections)
- `users`: { uid, name, email, role, institution, skills[], avatarUrl, createdAt }
- `subjects`: { id, name, department, teacherId, joinCode, term, createdAt }
- `enrollments`: { studentId, subjectId, teamName, joinedAt }
- `groups`: { id, name, type (class/hackathon), subjectId (if class), ownerId, members[], githubRepo, createdAt }
- `tasks`: { id, groupId, title, description, assigneeId, priority, status, dueDate, createdAt }
- `messages`: { id, groupId, senderId, text, fileUrl, fileName, timestamp }
- `progress`: { studentId, groupId, tasksTotal, tasksDone, lastActive, lastActivity }

---

## What to Fake (UI Complete, Data Static/Hardcoded)

These pages must look 100% identical to the designs but can use static/mock data — no real backend needed:

- **Teacher Cohort Progress Dashboard**
  Show 3 student cards with hardcoded names, progress rings (90%, 67%, 34%), last active badges, activity pills. Live activity feed on right side shows 4 hardcoded recent event cards with pulsing LIVE dot. Stat cards at top: 42 students, 28 active today, 76% avg completion, 12 pending reviews.

- **Student Detail / Version History Panel**
  Hardcoded student profile (Alex Chen), 3 tasks in timeline (Done/In Progress/Overdue), GitHub heatmap as static colored grid, meeting attendance table with 4 rows, version history panel with v12/v11/v10 nodes, teacher note textarea (just UI, no save action needed).

- **Files & Version Control Tab**
  Folder tree on left (Project/Source/Assets/Docs), file list with 3 files (Main.py, Algorithm_Brief.pdf, UML_Diagram_Draft.png), drag-and-drop upload zone (show the UI, upload not required to work), version history panel on right with v12/v11 nodes and amber teacher feedback card.

- **GitHub Tab**
  Repo connection card (show "edu-core/ds-team-a" as connected, Sync Now button does nothing), commit stream with 3 hardcoded commit cards (commit message, author, SHA in monospace, +/- lines), contribution heatmap as static colored grid, core contributors bar chart with 4 members, pull requests list with 2 PRs.

- **Meetings Tab**
  Weekly calendar strip (Mon-Sun, today highlighted), 2 upcoming meeting cards with Join Meeting / View Link buttons (links go nowhere), historical logs section with 2 past meetings showing expanded attendee list with checkmark/X chips. Right panel: 94% completion rate stat, meeting assets list (2 files).

- **Student Public Profile Page**
  Cover banner, large avatar, name, college, skills tags, bio, GitHub/LinkedIn icon buttons. Stats row: 4 hardcoded stat cards. Two columns: class projects cards + hackathon project cards. GitHub contribution heatmap at bottom (static grid).

- **Settings Page**
  Left secondary nav (Profile/Account/Notifications/Appearance/Integrations/Privacy). Profile section: avatar upload UI (no actual upload), name/email/bio/institution fields (pre-filled), skills tag input (add/remove tags works in UI), GitHub + LinkedIn URL fields, Save button (shows success toast, no real save needed). Notifications section: toggle switches (UI only). Appearance: Dark/Light/Auto mode cards + 4 accent color swatches (color switching actually works if possible, otherwise just UI). Integrations: GitHub connected card (static), Google Calendar establish link button (does nothing).

---

## Navigation Flow (How Pages Connect)

- `/` → Landing page
- `/auth` → Login/Register (role toggle, Firebase auth)

**After login as TEACHER:**
- `/teacher/subjects` → Subject Management (My Subjects page)
- `/teacher/analytics/:subjectId` → Cohort Progress Dashboard (fake)
- `/teacher/student/:studentId` → Student Detail Panel (fake)
- `/workspace/:groupId/overview` → Group Workspace Overview
- `/workspace/:groupId/chat` → Chat (real)
- `/workspace/:groupId/tasks` → Kanban (real)
- `/workspace/:groupId/files` → Files tab (fake)
- `/workspace/:groupId/github` → GitHub tab (fake)
- `/workspace/:groupId/meetings` → Meetings tab (fake)
- `/settings` → Settings (fake)

**After login as STUDENT:**
- `/student/dashboard` → Student Home (real — class + hackathon groups)
- `/workspace/:groupId/overview` → Group Workspace Overview (real)
- `/workspace/:groupId/chat` → Chat (real)
- `/workspace/:groupId/tasks` → Kanban (real)
- `/workspace/:groupId/files` → Files tab (fake)
- `/workspace/:groupId/github` → GitHub tab (fake)
- `/workspace/:groupId/meetings` → Meetings tab (fake)
- `/profile/:userId` → Public Profile (fake)
- `/settings` → Settings (fake)

---

## Tech Stack
- **Frontend:** React 18 + Vite + React Router v6
- **Styling:** Tailwind CSS (dark mode config) + custom CSS for glassmorphism effects
- **State:** React Context for auth + role, useState/useEffect for local state
- **Real-time:** Firestore onSnapshot listeners for chat and tasks
- **Backend:** Firebase (Firestore + Firebase Auth + Firebase Storage for file uploads)
- **Hosting:** Vercel
*(No separate backend server needed. Firebase handles everything.)*

---

## Hackathon Demo Flow (Most Important)
The app must demo cleanly in this order:

1. Landing page — shows the product
2. Register as Teacher → create a subject → copy join code
3. Register as Student → paste join code → enroll in class → create hackathon group
4. Open class workspace → send a chat message (real-time, show on teacher screen too) → create a task on kanban board
5. Teacher logs in → sees subject → clicks Analytics (fake but looks stunning) → clicks a student name (fake detail panel)
6. Student workspace → Overview tab → Files tab (fake but impressive) → GitHub tab (fake but impressive)
7. Settings page — quick look at profile

*Every page must be fully rendered with realistic-looking data even if fake. No empty states visible during demo except the "Join new class" card on student dashboard before enrolling.*

**The three things judges will see and remember:**
1. The live progress tracking visual (teacher cohort grid with progress rings)
2. The version control + teacher annotation panel
3. The GitHub commit feed integration visual
*(Make these three look the most impressive.)*
