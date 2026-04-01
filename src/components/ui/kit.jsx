import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { cn, getInitials } from "../../lib/utils";

export function MaterialIcon({ name, className, filled = false }) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={filled ? { fontVariationSettings: '"FILL" 1, "wght" 300, "GRAD" 0, "opsz" 24' } : {}}
    >
      {name}
    </span>
  );
}

export function BrandLockup({ compact = false, subtitle = "Kinetic Observatory" }) {
  return (
    <div className={compact ? "space-y-0.5" : "space-y-1"}>
      <div className="font-headline text-2xl font-black tracking-tight text-primary">
        EduCore
      </div>
      <div className="font-label text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">
        {subtitle}
      </div>
    </div>
  );
}

export function Avatar({ user, className = "h-10 w-10", initialsClassName = "" }) {
  const initials = getInitials(user?.name || user?.email || "Edu Core");
  const gradient = user?.avatarGradient || "from-primary/70 to-secondary/80";

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name || "Avatar"}
        className={cn("rounded-full border border-white/10 object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid place-items-center rounded-full border border-white/10 bg-gradient-to-br text-xs font-bold text-white",
        gradient,
        className,
        initialsClassName,
      )}
    >
      {initials}
    </div>
  );
}

export function ProgressRing({
  value = 0,
  size = 72,
  strokeWidth = 6,
  label,
  accent = "text-primary",
  trackClassName = "text-surface-container-highest",
  className,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn(accent, "drop-shadow-[0_0_8px_rgba(0,212,255,0.35)]")}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div className="font-headline text-sm font-bold text-on-surface">
          {label ?? `${progress}%`}
        </div>
      </div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-2">
        {eyebrow ? <div className="section-chip">{eyebrow}</div> : null}
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface md:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant md:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function EmptyPanel({ title, description, action, className }) {
  return (
    <div
      className={cn(
        "glass-panel rounded-3xl border-dashed border-outline-variant/30 p-8 text-center",
        className,
      )}
    >
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-surface-container-high">
        <MaterialIcon name="add_circle" className="text-primary" />
      </div>
      <h3 className="font-headline text-xl font-bold text-on-surface">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function LoadingScreen({ title = "Booting EduCore..." }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background hud-grid px-6">
      <div className="glass-panel-strong w-full max-w-md rounded-3xl p-10 text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full border border-primary/20 bg-primary/10 p-4 shadow-cyan">
          <div className="h-full w-full animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
        <div className="font-headline text-2xl font-bold text-on-surface">{title}</div>
        <div className="mt-2 text-sm text-on-surface-variant">
          Synchronizing the Kinetic Observatory shell.
        </div>
      </div>
    </div>
  );
}

export function Modal({ open, title, children, onClose, size = "max-w-xl" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md">
      <div className="flex min-h-full items-center justify-center p-6">
        <div className={cn("glass-panel-strong w-full rounded-3xl p-6", size)}>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-2xl font-bold text-on-surface">{title}</h3>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-on-surface-variant transition hover:bg-white/10 hover:text-on-surface"
              onClick={onClose}
            >
              <MaterialIcon name="close" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SideDrawer({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm">
      <div className="ml-auto flex h-full w-full max-w-xl flex-col bg-surface">
        <div className="topbar-shell flex items-center justify-between px-6 py-4">
          <h3 className="font-headline text-xl font-bold text-on-surface">{title}</h3>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-on-surface-variant transition hover:bg-white/10 hover:text-on-surface"
            onClick={onClose}
          >
            <MaterialIcon name="close" />
          </button>
        </div>
        <div className="scrollbar-subtle flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

export function StatusBadge({ tone = "primary", children }) {
  const toneMap = {
    primary: "border-primary/20 bg-primary/10 text-primary",
    secondary: "border-secondary/20 bg-secondary/10 text-secondary-soft",
    success: "border-success/20 bg-success/10 text-success",
    warning: "border-warning/20 bg-warning/10 text-warning",
    danger: "border-error/20 bg-error/10 text-error",
    neutral: "border-white/10 bg-white/5 text-on-surface-variant",
  };

  return <span className={cn("pill", toneMap[tone] || toneMap.neutral)}>{children}</span>;
}

export function InfoBanner({ icon = "info", tone = "warning", children }) {
  const toneClasses = {
    warning: "border-warning/20 bg-warning/10 text-warning",
    primary: "border-primary/20 bg-primary/10 text-primary",
  };

  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm", toneClasses[tone])}>
      <MaterialIcon name={icon} className="text-base" />
      <div>{children}</div>
    </div>
  );
}

export function InlineLinkButton({ to, children, className }) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-soft",
        className,
      )}
    >
      {children}
      <MaterialIcon name="arrow_forward" className="text-base" />
    </Link>
  );
}

export function ToastViewport() {
  const { toasts, removeToast } = useToast();

  const toneClasses = {
    info: "border-primary/20 bg-surface-container-high text-on-surface",
    success: "border-success/20 bg-surface-container-high text-on-surface",
    error: "border-error/20 bg-surface-container-high text-on-surface",
  };

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => removeToast(toast.id)}
          className={cn(
            "pointer-events-auto animate-float-up rounded-2xl border p-4 text-left shadow-glass backdrop-blur-xl transition hover:translate-y-[-2px]",
            toneClasses[toast.tone] || toneClasses.info,
          )}
        >
          <div className="font-headline text-sm font-bold">{toast.title}</div>
          {toast.description ? (
            <div className="mt-1 text-sm text-on-surface-variant">{toast.description}</div>
          ) : null}
        </button>
      ))}
    </div>
  );
}
