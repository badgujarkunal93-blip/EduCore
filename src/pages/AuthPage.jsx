import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BrandLockup, MaterialIcon, StatusBadge } from "../components/ui/kit";
import { cn } from "../lib/utils";

const roleCards = [
  { key: "teacher", title: "I am a Teacher", icon: "school", accent: "secondary" },
  { key: "student", title: "I am a Student", icon: "history_edu", accent: "primary" },
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState(searchParams.get("role") === "teacher" ? "teacher" : "student");
  const [form, setForm] = useState({
    name: "",
    institution: "Global Tech University",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { login, register, loginWithGoogle, isDemoMode } = useAuth();
  const { pushToast } = useToast();

  const title = useMemo(
    () => (mode === "login" ? "Initialize Core" : "Register New Entity"),
    [mode],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login({
          email: form.email,
          password: form.password,
        });
      } else {
        await register({
          name: form.name || (role === "teacher" ? "Teacher User" : "Student User"),
          email: form.email,
          password: form.password,
          role,
          institution: form.institution,
        });
      }
    } catch (error) {
      pushToast({
        title: "Authentication failed",
        description: error.message,
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle({
        role,
        name: form.name,
        institution: form.institution,
      });
    } catch (error) {
      pushToast({
        title: "Google sign-in failed",
        description: error.message,
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface text-on-surface">
      <div className="absolute inset-0 hud-grid opacity-70" />
      <div className="absolute left-[10%] top-[18%] h-[32rem] w-[32rem] rounded-full bg-secondary/20 blur-[140px]" />
      <div className="absolute bottom-[8%] right-[10%] h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-[120px]" />

      <header className="relative z-10 flex justify-center px-6 pt-12">
        <BrandLockup subtitle="Kinetic Observatory" />
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-14">
        <div className="glass-panel-strong w-full max-w-2xl rounded-[2rem] border-t border-primary/20 p-8 md:p-10">
          <div className="space-y-5">
            <div className="section-chip">01 Identity Protocol</div>
            <div className="grid gap-4 md:grid-cols-2">
              {roleCards.map((card) => {
                const active = role === card.key;
                return (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => setRole(card.key)}
                    className={cn(
                      "group flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 transition-all",
                      active
                        ? card.accent === "secondary"
                          ? "border-secondary/30 bg-secondary/15 shadow-violet"
                          : "border-primary/30 bg-primary/10 shadow-cyan"
                        : "border-white/5 bg-surface-container-low/60 hover:border-primary/20 hover:bg-surface-container",
                    )}
                  >
                    <MaterialIcon
                      name={card.icon}
                      className={cn(
                        "text-4xl",
                        active
                          ? card.accent === "secondary"
                            ? "text-secondary-soft"
                            : "text-primary"
                          : "text-on-surface-variant group-hover:text-primary",
                      )}
                      filled={active}
                    />
                    <div className="font-headline text-sm font-bold tracking-tight text-on-surface">
                      {card.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="section-chip">02 Secure Gateway</div>

            {mode === "register" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                    Entity Name
                  </label>
                  <input
                    className="kinetic-input"
                    placeholder={role === "teacher" ? "Dr. Nova Reed" : "Aarav Sharma"}
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                    Institution / College
                  </label>
                  <input
                    className="kinetic-input"
                    placeholder="Global Tech University"
                    value={form.institution}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, institution: event.target.value }))
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                  Institution / College
                </label>
                <input
                  className="kinetic-input"
                  placeholder="Global Tech University"
                  value={form.institution}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, institution: event.target.value }))
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                Email Matrix
              </label>
              <input
                className="kinetic-input"
                type="email"
                placeholder="access@educore.io"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                Access Cipher
              </label>
              <input
                className="kinetic-input"
                type="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </div>

            <button type="submit" className="secondary-btn w-full py-4" disabled={submitting}>
              {submitting ? "Synchronizing..." : title}
              <MaterialIcon name="arrow_forward" className="text-base" />
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-on-surface-variant">
              <button type="button" className="transition hover:text-primary">
                Forgot Cipher?
              </button>
              <button
                type="button"
                onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
                className="font-bold text-secondary-soft transition hover:text-on-surface"
              >
                {mode === "login" ? "Register New Entity" : "Back to Login"}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="font-label text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">
                External Auth
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              className="glass-panel flex w-full items-center justify-center gap-4 rounded-2xl px-4 py-4 transition hover:bg-surface-container"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-black">G</div>
              <span className="font-headline text-sm font-semibold tracking-tight text-on-surface">
                Sign in with Google Node
              </span>
            </button>

            {isDemoMode ? (
              <div className="glass-panel rounded-2xl border-primary/10 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <StatusBadge tone="primary">Demo Mode Active</StatusBadge>
                </div>
                <div className="space-y-2 text-sm text-on-surface-variant">
                  <div>
                    Teacher demo: <span className="text-on-surface">teacher@educore.dev</span> /{" "}
                    <span className="text-on-surface">Educore123!</span>
                  </div>
                  <div>
                    Student demo: <span className="text-on-surface">student@educore.dev</span> /{" "}
                    <span className="text-on-surface">Educore123!</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
