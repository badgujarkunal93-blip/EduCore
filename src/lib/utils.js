export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

export function createId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function generateJoinCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getInitials(name = "Edu Core") {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value?.toDate === "function") return value.toDate();

  return new Date(value);
}

export function formatDate(value, options = {}) {
  const date = parseDate(value);
  if (!date || Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: options.includeYear ? "numeric" : undefined,
    hour: options.includeTime ? "numeric" : undefined,
    minute: options.includeTime ? "2-digit" : undefined,
  }).format(date);
}

export function formatDateTime(value) {
  return formatDate(value, { includeYear: true, includeTime: true });
}

export function formatRelativeTime(value) {
  const date = parseDate(value);
  if (!date || Number.isNaN(date.getTime())) return "moments ago";

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return formatter.format(diffDays, "day");
  }

  const diffMonths = Math.round(diffDays / 30);
  return formatter.format(diffMonths, "month");
}

export function formatCount(value, singular, plural) {
  const word = value === 1 ? singular : plural || `${singular}s`;
  return `${value} ${word}`;
}

export function groupBy(items, selector) {
  return items.reduce((accumulator, item) => {
    const key = selector(item);
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push(item);
    return accumulator;
  }, {});
}

export function buildHeatmap(rows = 7, columns = 14, seed = 11) {
  const cells = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const value = (row * 17 + column * 13 + seed) % 5;
      cells.push(value);
    }
  }

  return cells;
}

export function avatarGradient(name = "") {
  const signatures = [
    "from-primary/60 to-secondary/70",
    "from-secondary/70 to-tertiary/80",
    "from-primary/70 to-cyan-200/50",
    "from-fuchsia-500/60 to-primary/60",
  ];

  const index =
    name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    signatures.length;

  return signatures[index];
}

export function sortByNewest(items, selector) {
  return [...items].sort((left, right) => {
    const leftDate = parseDate(selector(left))?.getTime() ?? 0;
    const rightDate = parseDate(selector(right))?.getTime() ?? 0;
    return rightDate - leftDate;
  });
}

export function canAccessGroup(group, profile, role) {
  if (!group || !profile) return false;

  if (group.members?.some((member) => member.uid === profile.uid || member === profile.uid)) {
    return true;
  }

  if (role === "teacher" && group.type === "class") {
    return group.ownerId === profile.uid || group.subject?.teacherId === profile.uid;
  }

  return false;
}
