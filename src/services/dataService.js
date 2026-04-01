import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, firebaseReady, googleProvider } from "../lib/firebase";
import {
  avatarGradient,
  createId,
  formatRelativeTime,
  generateJoinCode,
  parseDate,
  slugify,
  sortByNewest,
} from "../lib/utils";
import mockService from "./mockService";

function nowIso(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60000).toISOString();
}

function serializeSnapshot(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

function getProviderId(user) {
  return user?.providerData?.[0]?.providerId || "password";
}

function buildDemoAttachment(file) {
  return {
    fileUrl: "",
    fileName: file.name,
  };
}

async function getUserProfile(userId) {
  const snapshot = await getDoc(doc(db, "users", userId));
  return snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null;
}

function computeProgress(tasks) {
  const done = tasks.filter((task) => task.status === "done").length;
  return {
    total: tasks.length,
    done,
    percentage: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
}

function buildActivity(event) {
  return {
    id: createId("activity"),
    timestamp: event.timestamp || nowIso(),
    type: event.type,
    actorId: event.actorId,
    actorName: event.actorName,
    text: event.text,
    accent: event.accent || "primary",
  };
}

async function addGroupActivity(groupId, event) {
  const groupRef = doc(db, "groups", groupId);
  const groupSnapshot = await getDoc(groupRef);
  if (!groupSnapshot.exists()) return;

  const currentGroup = groupSnapshot.data();
  const activity = buildActivity(event);
  const activityFeed = [activity, ...(currentGroup.activityFeed || [])].slice(0, 12);

  await updateDoc(groupRef, {
    activityFeed,
    updatedAt: activity.timestamp,
  });
}

async function upsertProgressEntries(groupId, activityOverrides = {}) {
  const groupSnapshot = await getDoc(doc(db, "groups", groupId));
  if (!groupSnapshot.exists()) return;

  const group = groupSnapshot.data();
  const [taskSnapshot, usersSnapshot] = await Promise.all([
    getDocs(query(collection(db, "tasks"), where("groupId", "==", groupId))),
    getDocs(collection(db, "users")),
  ]);

  const tasks = serializeSnapshot(taskSnapshot);
  const users = serializeSnapshot(usersSnapshot);
  const students = group.members
    .map((memberId) => users.find((user) => user.uid === memberId))
    .filter((user) => user?.role === "student");

  await Promise.all(
    students.map((student) => {
      const assigned = tasks.filter((task) => task.assigneeId === student.uid);
      const taskSet = assigned.length ? assigned : tasks;
      const tasksTotal = taskSet.length;
      const tasksDone = taskSet.filter((task) => task.status === "done").length;
      const latest = sortByNewest(taskSet, (task) => task.updatedAt)[0];
      const override = activityOverrides[student.uid] || {};

      return setDoc(doc(db, "progress", `${groupId}_${student.uid}`), {
        id: `${groupId}_${student.uid}`,
        studentId: student.uid,
        groupId,
        tasksTotal,
        tasksDone,
        lastActive: override.lastActive || latest?.updatedAt || group.updatedAt || nowIso(),
        lastActivity:
          override.lastActivity ||
          (latest ? `${latest.title} is ${latest.status.replace("-", " ")}` : "No task activity yet"),
      });
    }),
  );
}

function subscribeMany(targets, callback) {
  const state = {};
  const keys = targets.map((target) => target.key);

  const unsubs = targets.map(({ key, ref, serializer = serializeSnapshot }) =>
    onSnapshot(ref, async (snapshot) => {
      state[key] = serializer(snapshot);
      if (keys.every((item) => item in state)) {
        callback(state);
      }
    }),
  );

  return () => unsubs.forEach((unsub) => unsub());
}

function chunkBySize(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function subscribeTasksForGroups(groupIds, callback) {
  if (!groupIds.length) {
    callback([]);
    return () => {};
  }

  const chunks = chunkBySize(groupIds, 10);
  const state = {};

  const emit = () => {
    if (Object.keys(state).length !== chunks.length) return;
    callback(Object.values(state).flat());
  };

  const unsubs = chunks.map((groupChunk, index) =>
    onSnapshot(
      query(collection(db, "tasks"), where("groupId", "in", groupChunk)),
      (snapshot) => {
        state[index] = serializeSnapshot(snapshot);
        emit();
      },
      () => {
        state[index] = [];
        emit();
      },
    ),
  );

  return () => unsubs.forEach((unsub) => unsub());
}

const firebaseService = {
  mode: "firebase",

  observeAuth(callback) {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (typeof unsubscribeProfile === "function") {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!user) {
        callback({ user: null, profile: null, role: null });
        return;
      }

      const authUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        providerId: getProviderId(user),
      };

      unsubscribeProfile = onSnapshot(
        doc(db, "users", user.uid),
        (snapshot) => {
          const profile = snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null;

          callback({
            user: authUser,
            profile,
            role: profile?.role || null,
          });
        },
        async () => {
          const profile = await getUserProfile(user.uid);
          callback({
            user: authUser,
            profile,
            role: profile?.role || null,
          });
        },
      );
    });

    return () => {
      if (typeof unsubscribeProfile === "function") {
        unsubscribeProfile();
      }
      unsubscribeAuth();
    };
  },

  async login({ email, password }) {
    await signInWithEmailAndPassword(auth, email, password);
  },

  async register({ name, email, password, role, institution }) {
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credentials.user, { displayName: name });

    await setDoc(doc(db, "users", credentials.user.uid), {
      uid: credentials.user.uid,
      name,
      email,
      role,
      institution,
      skills: role === "teacher" ? ["Mentorship", "Systems"] : ["React", "Python"],
      avatarUrl: "",
      avatarGradient: avatarGradient(name),
      createdAt: nowIso(),
    });
  },

  async loginWithGoogle({ role, name, institution }) {
    const provider = googleProvider || new GoogleAuthProvider();
    const credentials = await signInWithPopup(auth, provider);
    const existing = await getUserProfile(credentials.user.uid);

    const payload = {
      uid: credentials.user.uid,
      name: existing?.name || credentials.user.displayName || name || "EduCore User",
      email: credentials.user.email,
      role: existing?.role || role || "student",
      institution: existing?.institution || institution || "Global Tech University",
      skills: existing?.skills || ["React", "Python"],
      avatarUrl: existing?.avatarUrl || credentials.user.photoURL || "",
      avatarGradient: existing?.avatarGradient || avatarGradient(credentials.user.displayName || "EduCore"),
      createdAt: existing?.createdAt || nowIso(),
    };

    await setDoc(doc(db, "users", credentials.user.uid), payload, { merge: true });
  },

  async logout() {
    await signOut(auth);
  },

  subscribeTeacherSubjects(teacherId, callback) {
    return subscribeMany(
      [
        {
          key: "subjects",
          ref: query(collection(db, "subjects"), where("teacherId", "==", teacherId)),
        },
        { key: "groups", ref: collection(db, "groups") },
        { key: "enrollments", ref: collection(db, "enrollments") },
      ],
      ({ subjects, groups, enrollments }) => {
        const cards = subjects.map((subject) => {
          const workspace = groups.find((group) => group.subjectId === subject.id) || null;
          const studentCount = enrollments.filter(
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

        callback(cards);
      },
    );
  },

  subscribeTeacherAnalytics(subjectId, callback) {
    return subscribeMany(
      [
        {
          key: "subject",
          ref: doc(db, "subjects", subjectId),
          serializer: (snapshot) =>
            snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null,
        },
        { key: "groups", ref: collection(db, "groups") },
        { key: "users", ref: collection(db, "users") },
        { key: "progress", ref: collection(db, "progress") },
      ],
      ({ subject, groups, users, progress }) => {
        const workspace = groups.find((group) => group.subjectId === subjectId) || null;
        const students = (workspace?.members || [])
          .map((memberId) => users.find((user) => user.uid === memberId))
          .filter((user) => user?.role === "student")
          .map((student) => {
            const progressEntry = progress.find(
              (entry) => entry.studentId === student.uid && entry.groupId === workspace?.id,
            );
            const recentActivity = sortByNewest(
              (workspace?.activityFeed || []).filter((entry) => entry.actorId === student.uid),
              (entry) => entry.timestamp,
            )[0];
            const completion = progressEntry?.tasksTotal
              ? Math.round((progressEntry.tasksDone / progressEntry.tasksTotal) * 100)
              : 0;

            return {
              ...student,
              progress: completion,
              lastActive: progressEntry?.lastActive || workspace?.updatedAt || subject?.createdAt || nowIso(),
              activity:
                progressEntry?.lastActivity ||
                recentActivity?.text ||
                "Waiting for the first checkpoint",
            };
          });

        const activeToday = students.filter((student) => {
          const lastActive = parseDate(student.lastActive);
          if (!lastActive) return false;
          return Date.now() - lastActive.getTime() < 24 * 60 * 60 * 1000;
        }).length;
        const avgCompletion = students.length
          ? Math.round(
              students.reduce((sum, student) => sum + student.progress, 0) / students.length,
            )
          : 0;
        const pendingReviews = students.filter((student) =>
          student.activity.toLowerCase().includes("uploaded"),
        ).length;

        callback({
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
        });
      },
    );
  },

  async createSubject({ teacherId, name, department, term }) {
    const subjectRef = doc(collection(db, "subjects"));
    const groupRef = doc(collection(db, "groups"));
    const teacher = await getUserProfile(teacherId);
    const createdAt = nowIso();

    await setDoc(subjectRef, {
      id: subjectRef.id,
      name,
      department,
      teacherId,
      joinCode: generateJoinCode(),
      term,
      createdAt,
    });

    await setDoc(groupRef, {
      id: groupRef.id,
      name: `${name} Workspace`,
      type: "class",
      subjectId: subjectRef.id,
      ownerId: teacherId,
      members: [teacherId],
      githubRepo: "",
      description: `${name} collaborative workspace for labs, files, and task progress.`,
      announcement: `Welcome to ${name}. Use this shared workspace for tasks, updates, and weekly syncs.`,
      nextMeeting: null,
      activityFeed: [
        buildActivity({
          actorId: teacherId,
          actorName: teacher?.name || "Teacher",
          text: `created the ${name} subject workspace`,
          type: "subject_create",
        }),
      ],
      updatedAt: createdAt,
      createdAt,
    });

    return {
      subject: {
        id: subjectRef.id,
        name,
        department,
        teacherId,
        term,
        createdAt,
      },
      workspaceId: groupRef.id,
    };
  },

  async enrollWithJoinCode({ studentId, joinCode }) {
    const subjectSnapshot = await getDocs(
      query(collection(db, "subjects"), where("joinCode", "==", joinCode.trim()), limit(1)),
    );

    if (subjectSnapshot.empty) {
      throw new Error("That join code does not match any subject.");
    }

    const subject = { id: subjectSnapshot.docs[0].id, ...subjectSnapshot.docs[0].data() };

    const existingEnrollment = await getDocs(
      query(
        collection(db, "enrollments"),
        where("studentId", "==", studentId),
        where("subjectId", "==", subject.id),
      ),
    );

    if (existingEnrollment.empty) {
      await addDoc(collection(db, "enrollments"), {
        studentId,
        subjectId: subject.id,
        teamName: "Binary Bandits",
        joinedAt: nowIso(),
      });
    }

    const groupSnapshot = await getDocs(
      query(collection(db, "groups"), where("subjectId", "==", subject.id), limit(1)),
    );

    if (!groupSnapshot.empty) {
      const groupDoc = groupSnapshot.docs[0];
      await updateDoc(doc(db, "groups", groupDoc.id), {
        members: arrayUnion(studentId),
      });
      const student = await getUserProfile(studentId);
      await addGroupActivity(groupDoc.id, {
        type: "member_join",
        actorId: studentId,
        actorName: student?.name || "Student",
        text: `joined the workspace using code ${subject.joinCode}`,
        accent: "primary",
      });
      await upsertProgressEntries(groupDoc.id);
    }

    return subject;
  },

  async joinHackathonWithCode({ studentId, joinCode }) {
    const student = await getUserProfile(studentId);
    if (!student) {
      throw new Error("Your student profile could not be loaded. Please sign in again.");
    }

    if (student.role !== "student") {
      throw new Error("Only student accounts can join hackathon groups.");
    }

    const inviteCode = joinCode.trim();
    const groupSnapshot = await getDocs(
      query(collection(db, "groups"), where("joinCode", "==", inviteCode), limit(1)),
    );

    if (groupSnapshot.empty) {
      const subjectSnapshot = await getDocs(
        query(collection(db, "subjects"), where("joinCode", "==", inviteCode), limit(1)),
      );

      if (!subjectSnapshot.empty) {
        throw new Error("That code belongs to a class. Use 'Join new class' instead.");
      }

      throw new Error("That invite code does not match any hackathon group.");
    }

    const groupDoc = groupSnapshot.docs[0];
    const group = { id: groupDoc.id, ...groupDoc.data() };

    if (group.type !== "hackathon") {
      throw new Error("That invite code is not for a hackathon group.");
    }

    if (group.members?.includes(studentId)) {
      return group;
    }

    const joinedAt = nowIso();
    await updateDoc(doc(db, "groups", groupDoc.id), {
      members: [...(group.members || []), studentId],
    });
    await setDoc(
      doc(db, "progress", `${groupDoc.id}_${studentId}`),
      {
        id: `${groupDoc.id}_${studentId}`,
        studentId,
        groupId: groupDoc.id,
        tasksTotal: 0,
        tasksDone: 0,
        lastActive: joinedAt,
        lastActivity: `joined the team via invite code ${inviteCode}`,
      },
      { merge: true },
    );

    return group;
  },

  subscribeStudentDashboard(studentId, callback) {
    let latestBase = {
      groups: [],
      subjects: [],
      users: [],
      progress: [],
    };
    let latestTasks = [];
    let currentTaskKey = "";
    let unsubscribeTasks = () => {};

    const emit = () => {
      const { groups, subjects, users, progress } = latestBase;
      const memberGroups = groups.filter((group) => group.members?.includes(studentId));
      const profile = users.find((user) => user.uid === studentId) || null;

      const classGroups = memberGroups
        .filter((group) => group.type === "class")
        .map((group) => {
          const subject = subjects.find((item) => item.id === group.subjectId) || null;
          const teacher = subject ? users.find((user) => user.uid === subject.teacherId) : null;
          const progressEntry = progress.find(
            (entry) => entry.studentId === studentId && entry.groupId === group.id,
          );

          return {
            ...group,
            subject,
            teacher,
            completion: progressEntry?.tasksTotal
              ? Math.round((progressEntry.tasksDone / progressEntry.tasksTotal) * 100)
              : 0,
          };
        });

      const hackathonGroups = memberGroups
        .filter((group) => group.type === "hackathon")
        .map((group) => ({
          ...group,
          memberProfiles: (group.members || [])
            .map((memberId) => users.find((user) => user.uid === memberId))
            .filter(Boolean),
        }));

      const dueTasks = latestTasks.filter((task) => {
        const dueDate = parseDate(task.dueDate);
        return (
          task.assigneeId === studentId &&
          task.status !== "done" &&
          dueDate &&
          !Number.isNaN(dueDate.getTime()) &&
          dueDate > new Date()
        );
      }).length;

      callback({
        profile,
        classGroups,
        hackathonGroups,
        stats: {
          tasksDue: dueTasks,
          streak: 8,
          meetings: memberGroups.filter((group) => group.nextMeeting).length,
          commits: 24,
        },
      });
    };

    const syncTaskSubscription = (memberGroups) => {
      const nextGroupIds = memberGroups.map((group) => group.id).sort();
      const nextTaskKey = nextGroupIds.join("|");

      if (nextTaskKey === currentTaskKey) return;

      unsubscribeTasks();
      unsubscribeTasks = () => {};
      latestTasks = [];
      currentTaskKey = nextTaskKey;

      if (!nextGroupIds.length) {
        return;
      }

      unsubscribeTasks = subscribeTasksForGroups(nextGroupIds, (tasks) => {
        latestTasks = tasks;
        emit();
      });
    };

    const unsubscribeBase = subscribeMany(
      [
        { key: "groups", ref: collection(db, "groups") },
        { key: "subjects", ref: collection(db, "subjects") },
        { key: "users", ref: collection(db, "users") },
        { key: "progress", ref: collection(db, "progress") },
      ],
      ({ groups, subjects, users, progress }) => {
        latestBase = { groups, subjects, users, progress };
        syncTaskSubscription(groups.filter((group) => group.members?.includes(studentId)));
        emit();
      },
    );

    return () => {
      unsubscribeBase();
      unsubscribeTasks();
    };
  },

  async createHackathonGroup({ ownerId, name, description, githubRepo }) {
    const owner = await getUserProfile(ownerId);
    const groupRef = doc(collection(db, "groups"));
    const createdAt = nowIso();
    const joinCode = generateJoinCode();

    await setDoc(groupRef, {
      id: groupRef.id,
      name,
      type: "hackathon",
      subjectId: "",
      ownerId,
      members: [ownerId],
      joinCode,
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
        buildActivity({
          actorId: ownerId,
          actorName: owner?.name || "Owner",
          text: `created the ${name} hackathon group`,
          type: "group_create",
          accent: "tertiary",
        }),
      ],
      updatedAt: createdAt,
      createdAt,
    });

    await upsertProgressEntries(groupRef.id);

    return { id: groupRef.id, name, joinCode };
  },

  async ensureHackathonJoinCode({ groupId }) {
    const groupRef = doc(db, "groups", groupId);
    const snapshot = await getDoc(groupRef);

    if (!snapshot.exists()) {
      throw new Error("That hackathon group no longer exists.");
    }

    const group = snapshot.data();
    if (group.type !== "hackathon") {
      throw new Error("Invite codes are only available for hackathon groups.");
    }

    if (group.joinCode) {
      return group.joinCode;
    }

    const joinCode = generateJoinCode();
    await updateDoc(groupRef, { joinCode });
    return joinCode;
  },

  async regenerateHackathonJoinCode({ groupId }) {
    const groupRef = doc(db, "groups", groupId);
    const snapshot = await getDoc(groupRef);

    if (!snapshot.exists()) {
      throw new Error("That hackathon group no longer exists.");
    }

    const group = snapshot.data();
    if (group.type !== "hackathon") {
      throw new Error("Invite codes are only available for hackathon groups.");
    }

    const joinCode = generateJoinCode();
    await updateDoc(groupRef, { joinCode });
    return joinCode;
  },

  subscribeGroup(groupId, callback) {
    return subscribeMany(
      [
        {
          key: "group",
          ref: doc(db, "groups", groupId),
          serializer: (snapshot) =>
            snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null,
        },
        { key: "users", ref: collection(db, "users") },
        { key: "subjects", ref: collection(db, "subjects") },
        {
          key: "tasks",
          ref: query(collection(db, "tasks"), where("groupId", "==", groupId)),
        },
        { key: "progress", ref: collection(db, "progress") },
      ],
      ({ group, users, subjects, tasks, progress }) => {
        if (!group) {
          callback(null);
          return;
        }

        const owner = users.find((user) => user.uid === group.ownerId) || null;
        const subject = group.subjectId
          ? subjects.find((item) => item.id === group.subjectId) || null
          : null;
        const members = (group.members || [])
          .map((memberId) => users.find((user) => user.uid === memberId))
          .filter(Boolean)
          .map((member, index) => ({
            ...member,
            online: index % 2 === 0,
          }));

        callback({
          ...group,
          owner,
          subject,
          members,
          progressSummary: computeProgress(tasks),
          activityFeed: sortByNewest(group.activityFeed || [], (entry) => entry.timestamp),
          progressEntries: progress.filter((entry) => entry.groupId === groupId),
        });
      },
    );
  },

  async updateAnnouncement({ groupId, text, actorId }) {
    await updateDoc(doc(db, "groups", groupId), {
      announcement: text,
      updatedAt: nowIso(),
    });

    const actor = await getUserProfile(actorId);
    await addGroupActivity(groupId, {
      type: "announcement",
      actorId,
      actorName: actor?.name || "Member",
      text: "updated the pinned announcement",
      accent: "primary",
    });
  },

  async scheduleMeeting({ groupId, title, startsAt, link, platform }) {
    await updateDoc(doc(db, "groups", groupId), {
      nextMeeting: { title, startsAt, link, platform },
      updatedAt: nowIso(),
    });
  },

  subscribeTasks(groupId, callback) {
    return onSnapshot(
      query(collection(db, "tasks"), where("groupId", "==", groupId)),
      (snapshot) => {
        callback(sortByNewest(serializeSnapshot(snapshot), (task) => task.updatedAt));
      },
    );
  },

  async createTask({ groupId, title, description, assigneeId, priority, dueDate, actorId }) {
    const taskRef = doc(collection(db, "tasks"));
    const createdAt = nowIso();
    await setDoc(taskRef, {
      id: taskRef.id,
      groupId,
      title,
      description,
      assigneeId,
      priority,
      status: "backlog",
      dueDate,
      comments: [],
      createdAt,
      updatedAt: createdAt,
    });

    const actor = await getUserProfile(actorId);
    await addGroupActivity(groupId, {
      type: "task_create",
      actorId,
      actorName: actor?.name || "Member",
      text: `created task ${title}`,
      accent: "secondary",
    });
    await upsertProgressEntries(groupId);
  },

  async updateTask(taskId, patch, actorId) {
    const taskRef = doc(db, "tasks", taskId);
    const snapshot = await getDoc(taskRef);
    if (!snapshot.exists()) return;

    const task = snapshot.data();
    const previousStatus = task.status;
    await updateDoc(taskRef, {
      ...patch,
      updatedAt: nowIso(),
    });

    if (patch.status && patch.status !== previousStatus) {
      const actor = await getUserProfile(actorId || task.assigneeId);
      await addGroupActivity(task.groupId, {
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

    await upsertProgressEntries(task.groupId);
  },

  async addTaskComment(taskId, comment) {
    const taskRef = doc(db, "tasks", taskId);
    const snapshot = await getDoc(taskRef);
    if (!snapshot.exists()) return;

    const task = snapshot.data();
    const author = await getUserProfile(comment.authorId);
    const comments = [
      ...(task.comments || []),
      {
        id: createId("comment"),
        text: comment.text,
        authorId: comment.authorId,
        authorName: author?.name || "Member",
        createdAt: nowIso(),
      },
    ];

    await updateDoc(taskRef, {
      comments,
      updatedAt: nowIso(),
    });
  },

  subscribeMessages(groupId, callback) {
    return onSnapshot(
      query(collection(db, "messages"), where("groupId", "==", groupId)),
      (snapshot) => {
        callback(
          sortByNewest(serializeSnapshot(snapshot), (message) => message.timestamp).reverse(),
        );
      },
    );
  },

  async uploadChatFile(file, groupId, senderId) {
    return buildDemoAttachment(file, groupId, senderId);
  },

  async sendMessage({ groupId, senderId, text, fileName, fileUrl }) {
    const messageRef = doc(collection(db, "messages"));
    const timestamp = nowIso();
    await setDoc(messageRef, {
      id: messageRef.id,
      groupId,
      senderId,
      text,
      fileName: fileName || "",
      fileUrl: fileUrl || "",
      timestamp,
    });

    const sender = await getUserProfile(senderId);
    await addGroupActivity(groupId, {
      type: fileName ? "file_upload" : "message",
      actorId: senderId,
      actorName: sender?.name || "Member",
      text: fileName ? `uploaded ${fileName}` : "sent a new chat message",
      accent: fileName ? "primary" : "secondary",
    });

    if (fileName) {
      await upsertProgressEntries(groupId, {
        [senderId]: {
          lastActive: timestamp,
          lastActivity: `uploaded ${fileName}`,
        },
      });
    }
  },

  async getUserProfile(userId) {
    return getUserProfile(userId);
  },
};

const dataService = firebaseReady ? firebaseService : mockService;

export default dataService;
export const dataMode = dataService.mode;
