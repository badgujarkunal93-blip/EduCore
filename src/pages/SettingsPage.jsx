import { useMemo, useState } from "react";
import { StudentShell, TeacherShell } from "../components/layout/shells";
import { MaterialIcon, StatusBadge } from "../components/ui/kit";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { settingsSections, teacherPortalLinks } from "../lib/navigation";

export default function SettingsPage() {
  const { profile, role } = useAuth();
  const { themeMode, setThemeMode, accent, setAccent, accentPalettes } = useTheme();
  const { pushToast } = useToast();
  const [selectedSection, setSelectedSection] = useState("profile");
  const [skills, setSkills] = useState(profile?.skills || ["React", "Python", "TensorFlow"]);
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    name: profile?.name || "Alexander Sterling",
    email: profile?.email || "alex@educore.io",
    institution: profile?.institution || "Aether Institute of Advanced Learning",
    bio: "AI researcher and systems architect focused on educational systems and collaborative tooling.",
    github: "github.com/asterling",
    linkedin: "linkedin.com/in/asterling",
  });
  const [toggles, setToggles] = useState({
    taskAssignments: true,
    chatSubmissions: true,
    syncReminders: false,
  });

  const wrapperContent = (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {settingsSections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setSelectedSection(section.key)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                selectedSection === section.key
                  ? "border border-primary/20 bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <MaterialIcon name={section.icon} className="text-lg" />
              {section.label}
            </button>
          ))}
        </nav>

        <div className="space-y-8">
          <section className="glass-panel rounded-[2rem] p-8">
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="relative">
                <div className="grid h-32 w-32 place-items-center rounded-full border border-primary/20 bg-gradient-to-br from-primary to-secondary text-3xl font-bold text-white">
                  {form.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <button type="button" className="absolute bottom-1 right-1 rounded-full bg-primary p-2 text-black">
                  <MaterialIcon name="edit" className="text-sm" />
                </button>
              </div>

              <div className="flex-1 space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    ["Full Name", "name"],
                    ["Email Vector", "email"],
                    ["Digital Institution", "institution"],
                  ].map(([label, key]) => (
                    <div
                      key={key}
                      className={`space-y-2 ${key === "institution" ? "md:col-span-2" : ""}`}
                    >
                      <label className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                        {label}
                      </label>
                      <input
                        className="kinetic-input"
                        value={form[key]}
                        onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                      />
                    </div>
                  ))}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                      Bio Description
                    </label>
                    <textarea
                      className="kinetic-input min-h-28"
                      value={form.bio}
                      onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                    Active Skillsets
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => setSkills((current) => current.filter((item) => item !== skill))}
                        className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary-soft"
                      >
                        {skill} ×
                      </button>
                    ))}
                    <div className="flex gap-2">
                      <input
                        className="kinetic-input w-44 py-2"
                        placeholder="Add skill"
                        value={skillInput}
                        onChange={(event) => setSkillInput(event.target.value)}
                      />
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => {
                          if (!skillInput.trim()) return;
                          setSkills((current) => [...current, skillInput.trim()]);
                          setSkillInput("");
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="kinetic-input"
                    value={form.github}
                    onChange={(event) => setForm((current) => ({ ...current, github: event.target.value }))}
                  />
                  <input
                    className="kinetic-input"
                    value={form.linkedin}
                    onChange={(event) => setForm((current) => ({ ...current, linkedin: event.target.value }))}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() =>
                      pushToast({
                        title: "Settings saved",
                        description: "Profile changes were staged successfully.",
                        tone: "success",
                      })
                    }
                  >
                    Save Protocol Changes
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="glass-panel rounded-[2rem] p-8">
              <div className="font-headline text-2xl font-bold text-on-surface">Signal Filters</div>
              <div className="mt-6 space-y-5">
                {[
                  ["Task Assignments", "taskAssignments"],
                  ["Chat Submissions", "chatSubmissions"],
                  ["Sync Reminders", "syncReminders"],
                ].map(([label, key]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-on-surface">{label}</div>
                      <div className="mt-1 text-sm text-on-surface-variant">UI-only notification toggle</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setToggles((current) => ({ ...current, [key]: !current[key] }))}
                      className={`relative h-7 w-14 rounded-full ${
                        toggles[key] ? "bg-primary" : "bg-surface-container-highest"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                          toggles[key] ? "left-8" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-8">
              <div className="font-headline text-2xl font-bold text-on-surface">Interface Optics</div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {["dark", "light", "auto"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setThemeMode(mode)}
                    className={`rounded-2xl border p-4 text-left ${
                      themeMode === mode
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-white/5 bg-black/20 text-on-surface-variant"
                    }`}
                  >
                    <div className="font-semibold capitalize">{mode}</div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {accentPalettes.map((palette) => (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => setAccent(palette.id)}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      accent === palette.id
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-white/5 bg-black/20 text-on-surface-variant"
                    }`}
                  >
                    {palette.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="glass-panel rounded-[2rem] p-8">
              <div className="font-headline text-2xl font-bold text-on-surface">Integrations</div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="font-semibold text-on-surface">GitHub Connected</div>
                  <div className="mt-2 text-sm text-on-surface-variant">edu-core/ds-team-a</div>
                </div>
                <button type="button" className="ghost-btn">
                  Google Calendar Establish Link
                </button>
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-8">
              <div className="font-headline text-2xl font-bold text-on-surface">Privacy</div>
              <div className="mt-6 space-y-3 text-sm text-on-surface-variant">
                <div>Profile visibility: Public within institution</div>
                <div>Activity telemetry: Enabled</div>
                <div>Data export window: 30 days</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );

  const wrapper = role === "teacher" ? (
    <TeacherShell
      title="Command Settings"
      subtitle="Profile, notifications, appearance, and integrations."
      navLinks={teacherPortalLinks}
    >
      {wrapperContent}
    </TeacherShell>
  ) : (
    <StudentShell
      navLinks={[
        { to: "/student/dashboard", label: "Dashboard" },
        { to: "/settings", label: "Settings" },
      ]}
    >
      {wrapperContent}
    </StudentShell>
  );

  return wrapper;
}
