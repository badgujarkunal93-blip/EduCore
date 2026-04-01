import { buildHeatmap } from "./utils";

export const analyticsStudents = [
  {
    id: "alex-chen",
    name: "Alex Chen",
    progress: 90,
    lastActive: "2 min ago",
    activity: "New Commit",
    streak: "8 day streak",
  },
  {
    id: "sarah-miller",
    name: "Sarah Miller",
    progress: 67,
    lastActive: "18 min ago",
    activity: "Uploaded file",
    streak: "5 day streak",
  },
  {
    id: "rahul-nair",
    name: "Rahul Nair",
    progress: 34,
    lastActive: "1 hr ago",
    activity: "Pending review",
    streak: "2 day streak",
  },
];

export const analyticsFeed = [
  "Alex Chen pushed commit 7f3a9e to dev branch",
  "Sarah Miller uploaded Performance_Analysis_V2.pdf",
  "Rahul Nair opened Heap Sort fix task",
  "Alex Chen marked Red-Black Tree Visualizer done",
];

export const githubCommits = [
  {
    title: "Refactor AVL Tree rotations",
    author: "Alex Chen",
    branch: "dev",
    time: "10:45 AM",
    sha: "7f3a9e",
    plus: 142,
    minus: 28,
  },
  {
    title: "Update README with installation steps",
    author: "Sarah Miller",
    branch: "main",
    time: "Yesterday",
    sha: "b2c8d1",
    plus: 45,
    minus: 0,
  },
  {
    title: "Fix array index bounds in Heap Sort",
    author: "Rahul Nair",
    branch: "feature/heap-fix",
    time: "Oct 24",
    sha: "a4f21e",
    plus: 2,
    minus: 1,
  },
];

export const githubPullRequests = [
  {
    id: "pr-42",
    title: "Polish task board animations",
    author: "Kunal Demo",
    status: "Open",
  },
  {
    id: "pr-41",
    title: "Document setup flow for judges",
    author: "Sarah Miller",
    status: "Merged",
  },
];

export const contributorBars = [
  { label: "Kunal", value: 82 },
  { label: "Sarah", value: 64 },
  { label: "Alex", value: 52 },
  { label: "Rahul", value: 31 },
];

export const filesTable = [
  { name: "Main.py", author: "David Chen", modified: "2 hours ago", version: "v12", size: "24.5 KB" },
  { name: "Algorithm_Brief.pdf", author: "Sarah Miller", modified: "Yesterday", version: "v3", size: "1.2 MB" },
  { name: "UML_Diagram_Draft.png", author: "Alex Chen", modified: "3 days ago", version: "v11", size: "3.1 MB" },
];

export const versions = [
  { id: "v12", label: "v12", note: "Current revision with AVL patch review" },
  { id: "v11", label: "v11", note: "Teacher feedback injected" },
  { id: "v10", label: "v10", note: "Initial stable upload" },
];

export const meetingsUpcoming = [
  {
    id: "meet-1",
    time: "14:30",
    duration: "60 mins",
    title: "Sprint Sync: Data Struct V2",
    lead: "Alex Rivera",
    platform: "Google Meet",
  },
  {
    id: "meet-2",
    time: "16:00",
    duration: "45 mins",
    title: "Algo Review: Graph Theory",
    lead: "Dr. Sarah Chen",
    platform: "Zoom Platform",
  },
];

export const meetingsHistory = [
  {
    id: "history-1",
    date: "Apr 08",
    title: "Architecture Checkpoint",
    attendance: [
      { name: "Kunal", present: true },
      { name: "Sarah", present: true },
      { name: "Alex", present: false },
      { name: "Rahul", present: true },
    ],
  },
  {
    id: "history-2",
    date: "Apr 02",
    title: "Judge Storyline Rehearsal",
    attendance: [
      { name: "Kunal", present: true },
      { name: "Sarah", present: true },
      { name: "Alex", present: true },
      { name: "Rahul", present: false },
    ],
  },
];

export const publicProfileProjects = {
  classProjects: [
    "Advanced Algorithms Workspace",
    "Cloud Systems Monitoring Board",
    "Machine Vision Research Sprint",
  ],
  hackathonProjects: [
    "NeuralNav Dashboard",
    "Green-Chain Supply",
    "PulseOps AI Assistant",
  ],
};

export const heatmapData = buildHeatmap(7, 14, 19);
