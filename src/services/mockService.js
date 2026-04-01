import {
  avatarGradient,
  createId,
  formatRelativeTime,
  generateJoinCode,
  parseDate,
  slugify,
  sortByNewest,
} from "../lib/utils";

const STORAGE_KEY = "educore-demo-db-v2";
const DB_EVENT = "educore-demo-db";
const AUTH_EVENT = "educore-demo-auth";

function nowIso(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60000).toISOString();
}

function sampleActivity(timestamp, type, actorId, actorName, text, accent = "primary") {
  return {
    id: createId("activity"),
    timestamp,
    type,
    actorId,
    actorName,
    text,
    accent,
  };
}

function createSeedState() {
  const teacherId = "teacher_seed";
  const studentId = "student_seed";
  const sarahId = "student_sarah";
  const alexId = "student_alex";
  const rahulId = "student_rahul";
  const dsSubjectId = "subject_seed_ds";
  const dsGroupId = "group_seed_ds";
  const hackGroupId = "group_seed_hack";

  return {
    accounts: [
      {
        uid: teacherId,
        email: "teacher@educore.dev",
        password: "Educore123!",
        provider: "password",
      },
      {
        uid: studentId,
        email: "student@educore.dev",
        password: "Educore123!",
        provider: "password",
      },
    ],
    session: {
      currentUserId: null,
    },
    users: [
      {
        uid: teacherId,
        name: "Dr. Aris Thorne",
        email: "teacher@educore.dev",
        role: "teacher",
        institution: "Global Tech University",
        skills: ["Algorithms", "Mentorship", "Systems Design"],
        avatarUrl: "",
        avatarGradient: avatarGradient("Dr. Aris Thorne"),
        createdAt: nowIso(-60 * 24 * 20),
      },
      {
        uid: studentId,
        name: "Kunal Demo",
        email: "student@educore.dev",
        role: "student",
        institution: "Global Tech University",
        skills: ["React", "Python", "DSA"],
        avatarUrl: "",
        avatarGradient: avatarGradient("Kunal Demo"),
        createdAt: nowIso(-60 * 24 * 10),
      },
      {
        uid: sarahId,
        name: "Sarah Miller",
        email: "sarah@educore.dev",
        role: "student",
        institution: "Global Tech University",
        skills: ["Design", "Documentation"],
        avatarUrl: "",
        avatarGradient: avatarGradient("Sarah Miller"),
        createdAt: nowIso(-60 * 24 * 15),
      },
      {
        uid: alexId,
        name: "Alex Chen",
        email: "alex@educore.dev",
        role: "student",
        institution: "Global Tech University",
        skills: ["Python", "AI", "Research"],
        avatarUrl: "",
        avatarGradient: avatarGradient("Alex Chen"),
        createdAt: nowIso(-60 * 24 * 14),
      },
      {
        uid: rahulId,
        name: "Rahul Nair",
        email: "rahul@educore.dev",
        role: "student",
        institution: "Global Tech University",
        skills: ["Backend", "Git", "Testing"],
        avatarUrl: "",
        avatarGradient: avatarGradient("Rahul Nair"),
        createdAt: nowIso(-60 * 24 * 13),
      },
    ],
    subjects: [
      {
        id: dsSubjectId,
        name: "Data Structures",
        department: "Computer Science",
        teacherId,
        joinCode: "314159",
        term: "Winter 2026",
        createdAt: nowIso(-60 * 24 * 7),
      },
    ],
    enrollments: [
      {
        id: createId("enrollment"),
        studentId,
        subjectId: dsSubjectId,
        teamName: "Binary Bandits",
        joinedAt: nowIso(-60 * 24 * 6),
      },
      {
        id: createId("enrollment"),
        studentId: sarahId,
        subjectId: dsSubjectId,
        teamName: "Binary Bandits",
        joinedAt: nowIso(-60 * 24 * 6),
      },
      {
        id: createId("enrollment"),
        studentId: alexId,
        subjectId: dsSubjectId,
        teamName: "Binary Bandits",
        joinedAt: nowIso(-60 * 24 * 5),
      },
      {
        id: createId("enrollment"),
        studentId: rahulId,
        subjectId: dsSubjectId,
        teamName: "Binary Bandits",
        joinedAt: nowIso(-60 * 24 * 4),
      },
    ],
    groups: [
      {
        id: dsGroupId,
        name: "Data Structures Team A",
        type: "class",
        subjectId: dsSubjectId,
        ownerId: teacherId,
        members: [teacherId, studentId, sarahId, alexId, rahulId],
        githubRepo: "edu-core/ds-team-a",
        description: "Core class workspace for linked lists, trees, and graph systems.",
        announcement:
          "Team, we have moved into the implementation stage. Push tree optimizations before the Friday sync.",
        nextMeeting: {
          title: "Sprint Sync: Data Structures V2",
          startsAt: nowIso(60 * 20),
          link: "#",
          platform: "Google Meet",
        },
        activityFeed: [
          sampleActivity(
            nowIso(-12),
            "task_done",
            alexId,
            "Alex Chen",
            "marked Red-Black Tree Visualizer as done",
            "secondary",
          ),
          sampleActivity(
            nowIso(-90),
            "file_upload",
            sarahId,
            "Sarah Miller",
            "uploaded Performance_Analysis_V2.pdf",
            "primary",
          ),
          sampleActivity(
            nowIso(-60 * 18),
            "commit",
            rahulId,
            "Rahul Nair",
            "pushed 4 commits to feature/sorting-algos",
            "tertiary",
          ),
        ],
        updatedAt: nowIso(-12),
        createdAt: nowIso(-60 * 24 * 7),
      },
      {
        id: hackGroupId,
        name: "NeuralNav Dashboard",
        type: "hackathon",
        subjectId: "",
        ownerId: studentId,
        members: [studentId, sarahId, alexId],
        joinCode: "271828",
        githubRepo: "edu-core/neuralnav-dashboard",
        description:
          "Hackathon squad building an AI project orchestration cockpit for distributed teams.",
        announcement:
          "Demo polish sprint starts tonight. Keep commits small and annotate anything risky before merge.",
        nextMeeting: {
          title: "Hackathon Demo Rehearsal",
          startsAt: nowIso(60 * 8),
          link: "#",
          platform: "Google Meet",
        },
        activityFeed: [
          sampleActivity(
            nowIso(-16),
            "commit",
            studentId,
            "Kunal Demo",
            "synced GitHub repo and pushed dashboard refinements",
            "tertiary",
          ),
          sampleActivity(
            nowIso(-50),
            "task_create",
            sarahId,
            "Sarah Miller",
            "created UI polish task for landing sequence",
            "primary",
          ),
        ],
        updatedAt: nowIso(-16),
        createdAt: nowIso(-60 * 24 * 2),
      },
    ],
    tasks: [
      {
        id: createId("task"),
        groupId: dsGroupId,
        title: "AVL Tree Rotation Refactor",
        description: "Refactor the rotation utilities and add test coverage for balancing edge cases.",
        assigneeId: studentId,
        priority: "High",
        status: "in-progress",
        dueDate: nowIso(60 * 24 * 2),
        comments: [],
        createdAt: nowIso(-60 * 3),
        updatedAt: nowIso(-35),
      },
      {
        id: createId("task"),
        groupId: dsGroupId,
        title: "Prepare Complexity Cheatsheet",
        description: "Deliver the comparison sheet for heap, BST, and graph traversals.",
        assigneeId: sarahId,
        priority: "Medium",
        status: "todo",
        dueDate: nowIso(60 * 24 * 3),
        comments: [],
        createdAt: nowIso(-60 * 5),
        updatedAt: nowIso(-60 * 2),
      },
      {
        id: createId("task"),
        groupId: dsGroupId,
        title: "Red-Black Tree Visualizer",
        description: "Finalize the interactive visualizer for the class review session.",
        assigneeId: alexId,
        priority: "High",
        status: "done",
        dueDate: nowIso(-60 * 4),
        comments: [],
        createdAt: nowIso(-60 * 24),
        updatedAt: nowIso(-12),
      },
      {
        id: createId("task"),
        groupId: hackGroupId,
        title: "Demo Motion Polish",
        description: "Add staggered reveals and glow transitions across the main presentation surfaces.",
        assigneeId: sarahId,
        priority: "Low",
        status: "backlog",
        dueDate: nowIso(60 * 20),
        comments: [],
        createdAt: nowIso(-90),
        updatedAt: nowIso(-90),
      },
    ],
    messages: [
      {
        id: createId("message"),
        groupId: dsGroupId,
        senderId: sarahId,
        text: "Hey team, I just uploaded the latest draft of the doc. Please check the linked file below!",
        fileUrl: "#",
        fileName: "Project_Proposal_v2.pdf",
        timestamp: nowIso(-55),
      },
      {
        id: createId("message"),
        groupId: dsGroupId,
        senderId: alexId,
        text: "Great work, Sarah! This looks much cleaner than the previous version.",
        fileUrl: "",
        fileName: "",
        timestamp: nowIso(-52),
      },
      {
        id: createId("message"),
        groupId: dsGroupId,
        senderId: studentId,
        text: "I’m taking the AVL rotation task next. Will post the patch before lunch.",
        fileUrl: "",
        fileName: "",
        timestamp: nowIso(-48),
      },
    ],
    progress: [
      {
        id: createId("progress"),
        studentId,
        groupId: dsGroupId,
        tasksTotal: 3,
        tasksDone: 1,
        lastActive: nowIso(-48),
        lastActivity: "Preparing AVL rotation patch",
      },
      {
        id: createId("progress"),
        studentId,
        groupId: hackGroupId,
        tasksTotal: 1,
        tasksDone: 0,
        lastActive: nowIso(-16),
        lastActivity: "Synced GitHub repo",
      },
    ],
  };
}

function ensureState() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const seed = createSeedState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(existing);
  } catch {
    const seed = createSeedState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function getState() {
  return ensureState();
}

function setState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(DB_EVENT));
}

function emitAuth() {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

function updateState(mutator) {
  const state = getState();
  mutator(state);
  setState(state);
  return state;
}

function subscribeToEvents(handler) {
  window.addEventListener(DB_EVENT, handler);
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(DB_EVENT, handler);
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function getUser(state, userId) {
  return state.users.find((user) => user.uid === userId) || null;
}

function getCurrentSession() {
  const state = getState();
  const currentUserId = state.session.currentUserId;
  const profile = currentUserId ? getUser(state, currentUserId) : null;

  if (!profile) {
    return { user: null, profile: null, role: null };
  }

  return {
    user: {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.name,
      providerId: "mock",
    },
    profile,
    role: profile.role,
  };
}

function buildTeacherSubjects(state, teacherId) {
  const teacherSubjects = state.subjects.filter((subject) => subject.teacherId === teacherId);

  return teacherSubjects.map((subject) => {
    const workspace = state.groups.find((group) => group.subjectId === subject.id) || null;
    const studentCount = state.enrollments.filter(
      (enrollment) => enrollment.subjectId === subject.id,
    ).length;

    return {
      ...subject,
      workspaceId: workspace?.id || "",
      studentCount,
      lastActivity: workspace?.updatedAt || subject.createdAt,
      activityLabel:
        workspace?.activityFeed?.[0]?.text ||
        `Created ${formatRelativeTime(subject.createdAt)}`,
      githubRepo: workspace?.githubRepo || "",
    };
  });
}

function upsertProgressEntries(state, groupId, activityOverrides = {}) {
  const group = state.groups.find((item) => item.id === groupId);
  if (!group) return;

  const tasks = state.tasks.filter((task) => task.groupId === groupId);
  const memberIds = group.members.filter((memberId) => getUser(state, memberId)?.role === "student");

  memberIds.forEach((studentId) => {
    const assigned = tasks.filter((task) => task.assigneeId === studentId);
    const tasksTotal = assigned.length || tasks.length;
    const tasksDone =
      assigned.length > 0
        ? assigned.filter((task) => task.status === "done").length
        : tasks.filter((task) => task.status === "done").length;
    const latestTask = sortByNewest(assigned.length ? assigned : tasks, (task) => task.updatedAt)[0];
    const existing = state.progress.find(
      (entry) => entry.studentId === studentId && entry.groupId === groupId,
    );
    const override = activityOverrides[studentId] || {};
    const progressPayload = {
      id: existing?.id || createId("progress"),
      studentId,
      groupId,
      tasksTotal,
      tasksDone,
      lastActive: override.lastActive || latestTask?.updatedAt || group.updatedAt || nowIso(),
      lastActivity:
        override.lastActivity ||
        (latestTask
          ? `${latestTask.title} is ${latestTask.status.replace("-", " ")}`
          : "No task activity yet"),
    };

    if (existing) {
      Object.assign(existing, progressPayload);
    } else {
      state.progress.push(progressPayload);
    }
  });
}

function addGroupActivity(state, groupId, event) {
  const group = state.groups.find((item) => item.id === groupId);
  if (!group) return;

  const activity = {
    id: createId("activity"),
    timestamp: event.timestamp || nowIso(),
    type: event.type,
    actorId: event.actorId,
    actorName: event.actorName,
    text: event.text,
    accent: event.accent || "primary",
  };

  group.activityFeed = [activity, ...(group.activityFeed || [])].slice(0, 12);
  group.updatedAt = activity.timestamp;
}

function hydrateGroup(state, group) {
  const subject = group.subjectId
    ? state.subjects.find((item) => item.id === group.subjectId) || null
    : null;
  const owner = getUser(state, group.ownerId);
  const members = group.members
    .map((memberId) => getUser(state, memberId))
    .filter(Boolean)
    .map((member) => ({
      ...member,
      online: ["student_seed", "student_sarah", "student_rahul"].includes(member.uid),
    }));
  const tasks = state.tasks.filter((task) => task.groupId === group.id);
  const progressEntries = state.progress.filter((entry) => entry.groupId === group.id);
  const tasksDone = tasks.filter((task) => task.status === "done").length;

  return {
    ...group,
    subject,
    owner,
    members,
    progressSummary: {
      total: tasks.length,
      done: tasksDone,
      percentage: tasks.length ? Math.round((tasksDone / tasks.length) * 100) : 0,
    },
    activityFeed: sortByNewest(group.activityFeed || [], (entry) => entry.timestamp),
    nextMeeting: group.nextMeeting || null,
    progressEntries,
  };
}

function buildStudentDashboard(state, userId) {
  const profile = getUser(state, userId);
  const classGroups = state.groups
    .filter((group) => group.type === "class" && group.members.includes(userId))
    .map((group) => {
      const subject = state.subjects.find((item) => item.id === group.subjectId) || null;
      const teacher = subject ? getUser(state, subject.teacherId) : null;
      const progress =
        state.progress.find((entry) => entry.studentId === userId && entry.groupId === group.id) ||
        null;

      return {
        ...group,
        subject,
        teacher,
        completion: progress?.tasksTotal
          ? Math.round((progress.tasksDone / progress.tasksTotal) * 100)
          : 0,
      };
    });

  const hackathonGroups = state.groups
    .filter((group) => group.type === "hackathon" && group.members.includes(userId))
    .map((group) => ({
      ...group,
      memberProfiles: group.members.map((memberId) => getUser(state, memberId)).filter(Boolean),
    }));

  const dueTasks = state.tasks.filter((task) => {
    const dueDate = parseDate(task.dueDate);
    return task.assigneeId === userId && task.status !== "done" && dueDate && dueDate > new Date();
  }).length;

  return {
    profile,
    classGroups,
    hackathonGroups,
    stats: {
      tasksDue: dueTasks,
      streak: 8,
      meetings: state.groups.filter((group) => group.members.includes(userId) && group.nextMeeting).length,
      commits: 24,
    },
  };
}

function buildTeacherAnalytics(state, subjectId) {
  const subject = state.subjects.find((item) => item.id === subjectId) || null;
  const workspace = state.groups.find((group) => group.subjectId === subjectId) || null;
  const students = (workspace?.members || [])
    .map((memberId) => getUser(state, memberId))
    .filter((user) => user?.role === "student")
    .map((student) => {
      const progress = state.progress.find(
        (entry) => entry.studentId === student.uid && entry.groupId === workspace?.id,
      );
      const recentActivity = sortByNewest(
        (workspace?.activityFeed || []).filter((entry) => entry.actorId === student.uid),
        (entry) => entry.timestamp,
      )[0];
      const completion = progress?.tasksTotal
        ? Math.round((progress.tasksDone / progress.tasksTotal) * 100)
        : 0;

      return {
        ...student,
        progress: completion,
        lastActive: progress?.lastActive || workspace?.updatedAt || subject?.createdAt || nowIso(),
        activity:
          progress?.lastActivity || recentActivity?.text || "Waiting for the first checkpoint",
      };
    });

  const activeToday = students.filter((student) => {
    const lastActive = parseDate(student.lastActive);
    if (!lastActive) return false;
    return Date.now() - lastActive.getTime() < 24 * 60 * 60 * 1000;
  }).length;
  const avgCompletion = students.length
    ? Math.round(students.reduce((sum, student) => sum + student.progress, 0) / students.length)
    : 0;
  const pendingReviews = students.filter((student) =>
    student.activity.toLowerCase().includes("uploaded"),
  ).length;

  return {
    subject,
    workspace,
    students,
    activityFeed: sortByNewest(workspace?.activityFeed || [], (entry) => entry.timestamp).slice(0, 4),
    stats: {
      totalStudents: students.length,
      activeToday,
      avgCompletion,
      pendingReviews,
    },
  };
}

const mockService = {
  mode: "demo",

  observeAuth(callback) {
    callback(getCurrentSession());

    return subscribeToEvents(() => {
      callback(getCurrentSession());
    });
  },

  async login({ email, password }) {
    const state = getState();
    const account = state.accounts.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password,
    );

    if (!account) {
      throw new Error("Invalid demo credentials. Try teacher@educore.dev or student@educore.dev.");
    }

    updateState((draft) => {
      draft.session.currentUserId = account.uid;
    });
    emitAuth();
    return getCurrentSession();
  },

  async register({ name, email, password, role, institution }) {
    const state = getState();
    const duplicate = state.accounts.some(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );

    if (duplicate) {
      throw new Error("That email is already registered in demo mode.");
    }

    const uid = createId("user");
    updateState((draft) => {
      draft.accounts.push({
        uid,
        email,
        password,
        provider: "password",
      });
      draft.users.push({
        uid,
        name,
        email,
        role,
        institution,
        skills: role === "teacher" ? ["Mentorship", "Systems"] : ["React", "Python"],
        avatarUrl: "",
        avatarGradient: avatarGradient(name),
        createdAt: nowIso(),
      });
      draft.session.currentUserId = uid;
    });
    emitAuth();
    return getCurrentSession();
  },

  async loginWithGoogle({ role, name, institution }) {
    const uid = createId("google");
    const finalName =
      name || (role === "teacher" ? "Professor Nova" : "Orbit Student");
    const email = `${slugify(finalName)}@gmail.demo`;

    updateState((draft) => {
      draft.accounts.push({
        uid,
        email,
        password: "",
        provider: "google",
      });
      draft.users.push({
        uid,
        name: finalName,
        email,
        role,
        institution: institution || "Global Tech University",
        skills: role === "teacher" ? ["Mentorship", "AI"] : ["Frontend", "Git"],
        avatarUrl: "",
        avatarGradient: avatarGradient(finalName),
        createdAt: nowIso(),
      });
      draft.session.currentUserId = uid;
    });

    emitAuth();
    return getCurrentSession();
  },

  async logout() {
    updateState((draft) => {
      draft.session.currentUserId = null;
    });
    emitAuth();
  },

  subscribeTeacherSubjects(teacherId, callback) {
    const send = () => {
      const state = getState();
      callback(buildTeacherSubjects(state, teacherId));
    };

    send();
    return subscribeToEvents(send);
  },

  subscribeTeacherAnalytics(subjectId, callback) {
    const send = () => {
      const state = getState();
      callback(buildTeacherAnalytics(state, subjectId));
    };

    send();
    return subscribeToEvents(send);
  },

  async createSubject({ teacherId, name, department, term }) {
    const id = createId("subject");
    const groupId = createId("group");
    const state = updateState((draft) => {
      draft.subjects.push({
        id,
        name,
        department,
        teacherId,
        joinCode: generateJoinCode(),
        term,
        createdAt: nowIso(),
      });

      const teacher = getUser(draft, teacherId);
      draft.groups.push({
        id: groupId,
        name: `${name} Workspace`,
        type: "class",
        subjectId: id,
        ownerId: teacherId,
        members: [teacherId],
        githubRepo: "",
        description: `${name} collaborative workspace for labs, files, and task progress.`,
        announcement: `Welcome to ${name}. Use this shared workspace for tasks, updates, and weekly syncs.`,
        nextMeeting: null,
        activityFeed: [
          {
            id: createId("activity"),
            timestamp: nowIso(),
            type: "subject_create",
            actorId: teacherId,
            actorName: teacher?.name || "Teacher",
            text: `created the ${name} subject workspace`,
            accent: "primary",
          },
        ],
        updatedAt: nowIso(),
        createdAt: nowIso(),
      });
    });

    const subject = state.subjects.find((item) => item.id === id);
    return {
      subject,
      workspaceId: groupId,
    };
  },

  async enrollWithJoinCode({ studentId, joinCode }) {
    const state = getState();
    const subject = state.subjects.find((item) => item.joinCode === joinCode.trim());
    if (!subject) {
      throw new Error("That join code does not match any subject.");
    }

    const alreadyEnrolled = state.enrollments.some(
      (item) => item.studentId === studentId && item.subjectId === subject.id,
    );
    if (alreadyEnrolled) {
      return subject;
    }

    updateState((draft) => {
      draft.enrollments.push({
        id: createId("enrollment"),
        studentId,
        subjectId: subject.id,
        teamName: "Binary Bandits",
        joinedAt: nowIso(),
      });

      const group = draft.groups.find((item) => item.subjectId === subject.id);
      const student = getUser(draft, studentId);
      if (group && !group.members.includes(studentId)) {
        group.members.push(studentId);
        addGroupActivity(draft, group.id, {
          type: "member_join",
          actorId: studentId,
          actorName: student?.name || "Student",
          text: `joined the workspace using code ${subject.joinCode}`,
          accent: "primary",
        });
        upsertProgressEntries(draft, group.id);
      }
    });

    return subject;
  },

  async joinHackathonWithCode({ studentId, joinCode }) {
    const state = getState();
    const student = getUser(state, studentId);
    if (!student) {
      throw new Error("Your student profile could not be loaded. Please sign in again.");
    }

    if (student.role !== "student") {
      throw new Error("Only student accounts can join hackathon groups.");
    }

    const group = state.groups.find(
      (item) => item.type === "hackathon" && item.joinCode === joinCode.trim(),
    );

    if (!group) {
      throw new Error("That invite code does not match any hackathon group.");
    }

    if (group.members.includes(studentId)) {
      return group;
    }

    const joinedAt = nowIso();
    updateState((draft) => {
      const nextGroup = draft.groups.find((item) => item.id === group.id);
      const nextStudent = getUser(draft, studentId);

      if (!nextGroup || nextGroup.members.includes(studentId)) return;

      nextGroup.members.push(studentId);
      addGroupActivity(draft, nextGroup.id, {
        type: "member_join",
        actorId: studentId,
        actorName: nextStudent?.name || "Student",
        text: `joined the hackathon squad using code ${nextGroup.joinCode}`,
        accent: "tertiary",
      });
      upsertProgressEntries(draft, nextGroup.id, {
        [studentId]: {
          lastActive: joinedAt,
          lastActivity: `joined the team via invite code ${nextGroup.joinCode}`,
        },
      });
    });

    return getState().groups.find((item) => item.id === group.id);
  },

  subscribeStudentDashboard(studentId, callback) {
    const send = () => {
      const state = getState();
      callback(buildStudentDashboard(state, studentId));
    };

    send();
    return subscribeToEvents(send);
  },

  async createHackathonGroup({ ownerId, name, description, githubRepo }) {
    const id = createId("group");
    const state = updateState((draft) => {
      const owner = getUser(draft, ownerId);
      draft.groups.push({
        id,
        name,
        type: "hackathon",
        subjectId: "",
        ownerId,
        members: [ownerId],
        joinCode: generateJoinCode(),
        githubRepo: githubRepo || `edu-core/${slugify(name)}`,
        description,
        announcement:
          "Hackathon workspace initialized. Capture tasks, sync files, and keep the chat active.",
        nextMeeting: {
          title: "Hackathon Standup",
          startsAt: nowIso(60 * 12),
          link: "#",
          platform: "Google Meet",
        },
        activityFeed: [
          {
            id: createId("activity"),
            timestamp: nowIso(),
            type: "group_create",
            actorId: ownerId,
            actorName: owner?.name || "Owner",
            text: `created the ${name} hackathon group`,
            accent: "tertiary",
          },
        ],
        updatedAt: nowIso(),
        createdAt: nowIso(),
      });
    });

    const group = state.groups.find((item) => item.id === id);
    upsertProgressEntries(state, id);
    setState(state);
    return group;
  },

  async ensureHackathonJoinCode({ groupId }) {
    const state = getState();
    const group = state.groups.find((item) => item.id === groupId);

    if (!group) {
      throw new Error("That hackathon group no longer exists.");
    }

    if (group.type !== "hackathon") {
      throw new Error("Invite codes are only available for hackathon groups.");
    }

    if (group.joinCode) {
      return group.joinCode;
    }

    const joinCode = generateJoinCode();
    updateState((draft) => {
      const nextGroup = draft.groups.find((item) => item.id === groupId);
      if (nextGroup) {
        nextGroup.joinCode = joinCode;
        nextGroup.updatedAt = nowIso();
      }
    });

    return joinCode;
  },

  async regenerateHackathonJoinCode({ groupId }) {
    const state = getState();
    const group = state.groups.find((item) => item.id === groupId);

    if (!group) {
      throw new Error("That hackathon group no longer exists.");
    }

    if (group.type !== "hackathon") {
      throw new Error("Invite codes are only available for hackathon groups.");
    }

    const joinCode = generateJoinCode();
    updateState((draft) => {
      const nextGroup = draft.groups.find((item) => item.id === groupId);
      if (nextGroup) {
        nextGroup.joinCode = joinCode;
        nextGroup.updatedAt = nowIso();
      }
    });

    return joinCode;
  },

  subscribeGroup(groupId, callback) {
    const send = () => {
      const state = getState();
      const group = state.groups.find((item) => item.id === groupId);
      callback(group ? hydrateGroup(state, group) : null);
    };

    send();
    return subscribeToEvents(send);
  },

  async updateAnnouncement({ groupId, text, actorId }) {
    updateState((draft) => {
      const group = draft.groups.find((item) => item.id === groupId);
      const actor = getUser(draft, actorId);
      if (!group) return;

      group.announcement = text;
      addGroupActivity(draft, groupId, {
        type: "announcement",
        actorId,
        actorName: actor?.name || "Member",
        text: "updated the pinned announcement",
        accent: "primary",
      });
    });
  },

  async scheduleMeeting({ groupId, title, startsAt, link, platform }) {
    updateState((draft) => {
      const group = draft.groups.find((item) => item.id === groupId);
      if (!group) return;

      group.nextMeeting = { title, startsAt, link, platform };
      group.updatedAt = nowIso();
    });
  },

  subscribeTasks(groupId, callback) {
    const send = () => {
      const state = getState();
      callback(
        sortByNewest(
          state.tasks.filter((task) => task.groupId === groupId),
          (task) => task.updatedAt,
        ),
      );
    };

    send();
    return subscribeToEvents(send);
  },

  async createTask({ groupId, title, description, assigneeId, priority, dueDate, actorId }) {
    const state = updateState((draft) => {
      draft.tasks.push({
        id: createId("task"),
        groupId,
        title,
        description,
        assigneeId,
        priority,
        status: "backlog",
        dueDate,
        comments: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });

      const actor = getUser(draft, actorId);
      addGroupActivity(draft, groupId, {
        type: "task_create",
        actorId,
        actorName: actor?.name || "Member",
        text: `created task ${title}`,
        accent: "secondary",
      });

      upsertProgressEntries(draft, groupId);
    });

    return state.tasks[state.tasks.length - 1];
  },

  async updateTask(taskId, patch, actorId) {
    updateState((draft) => {
      const task = draft.tasks.find((item) => item.id === taskId);
      if (!task) return;

      const previousStatus = task.status;
      Object.assign(task, patch, { updatedAt: nowIso() });

      if (patch.status && patch.status !== previousStatus) {
        const actor = getUser(draft, actorId || task.assigneeId);
        addGroupActivity(draft, task.groupId, {
          type: patch.status === "done" ? "task_done" : "task_update",
          actorId: actor?.uid || task.assigneeId,
          actorName: actor?.name || "Member",
          text:
            patch.status === "done"
              ? `marked ${task.title} as done`
              : `moved ${task.title} to ${patch.status}`,
          accent: patch.status === "done" ? "secondary" : "primary",
        });
      }

      upsertProgressEntries(draft, task.groupId);
    });
  },

  async addTaskComment(taskId, comment) {
    updateState((draft) => {
      const task = draft.tasks.find((item) => item.id === taskId);
      const user = getUser(draft, comment.authorId);
      if (!task) return;

      task.comments = [
        ...(task.comments || []),
        {
          id: createId("comment"),
          text: comment.text,
          authorId: comment.authorId,
          authorName: user?.name || "Member",
          createdAt: nowIso(),
        },
      ];
      task.updatedAt = nowIso();
    });
  },

  subscribeMessages(groupId, callback) {
    const send = () => {
      const state = getState();
      callback(
        sortByNewest(
          state.messages.filter((message) => message.groupId === groupId),
          (message) => message.timestamp,
        ).reverse(),
      );
    };

    send();
    return subscribeToEvents(send);
  },

  async uploadChatFile(file) {
    return {
      fileUrl: "#",
      fileName: file.name,
    };
  },

  async sendMessage({ groupId, senderId, text, fileName, fileUrl }) {
    const timestamp = nowIso();
    const state = updateState((draft) => {
      draft.messages.push({
        id: createId("message"),
        groupId,
        senderId,
        text,
        fileName: fileName || "",
        fileUrl: fileUrl || "",
        timestamp,
      });

      const sender = getUser(draft, senderId);
      addGroupActivity(draft, groupId, {
        type: fileName ? "file_upload" : "message",
        actorId: senderId,
        actorName: sender?.name || "Member",
        text: fileName
          ? `uploaded ${fileName}`
          : `sent a new chat message`,
        accent: fileName ? "primary" : "secondary",
      });

      if (fileName) {
        upsertProgressEntries(draft, groupId, {
          [senderId]: {
            lastActive: timestamp,
            lastActivity: `uploaded ${fileName}`,
          },
        });
      }
    });

    return state.messages[state.messages.length - 1];
  },

  async getUserProfile(userId) {
    const state = getState();
    return getUser(state, userId);
  },
};

export default mockService;
