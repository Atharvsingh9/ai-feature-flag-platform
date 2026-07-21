import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Bell, Moon, Sun, Search, ChevronRight, MonitorPlay } from "lucide-react";
import { NAV_ITEMS } from "../../utils/constants";
import { useDemo } from "../../context/DemoContext";

interface NavbarProps {
  dark: boolean;
  onToggleDark: () => void;
}

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const match = NAV_ITEMS.find((n) => (n.path === "/" ? pathname === "/" : pathname.startsWith(n.path)));
  return match?.label ?? "Overview";
}

export function Navbar({ dark, onToggleDark }: NavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { enabled: demoEnabled, toggle: toggleDemo } = useDemo();
  const crumb = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/[0.04] bg-white/60 px-6 py-4 backdrop-blur-xl">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-ink-500">
          <Link to="/" className="hover:text-ink-900">Aegis Flags</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink-900">{crumb}</span>
        </div>
        <h1 className="mt-0.5 font-display text-lg font-semibold text-ink-900">{crumb}</h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative hidden max-w-xs flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            placeholder="Search flags, rollouts..."
            className="focus-ring w-full rounded-xl2 border border-ink-300/40 bg-white/80 py-2 pl-9 pr-3 text-sm placeholder:text-ink-500"
          />
        </div>

        <button
          onClick={toggleDemo}
          className={`focus-ring flex items-center gap-2 rounded-xl2 border px-3 py-1.5 text-xs font-medium transition-colors ${
            demoEnabled
              ? "border-success/30 bg-success-50 text-success"
              : "border-ink-300/40 bg-white text-ink-700 hover:bg-surface-bg"
          }`}
        >
          <MonitorPlay className={`h-3.5 w-3.5 ${demoEnabled ? "animate-pulse" : ""}`} />
          {demoEnabled ? "Demo On" : "Demo"}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-xl2 border border-ink-300/40 bg-white text-ink-700 hover:bg-surface-bg"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-error" />
          </button>
          {notifOpen && (
            <div className="card absolute right-0 top-11 w-72 p-2 animate-fade-up">
              <p className="px-2 py-1.5 text-xs font-semibold text-ink-500">Notifications</p>
              {["Canary passed for Smart Summarizer", "Rollback triggered for Invoice Parser", "Quality dipped below threshold"].map((n) => (
                <div key={n} className="rounded-xl px-2 py-2 text-sm text-ink-700 hover:bg-surface-bg">
                  {n}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onToggleDark}
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl2 border border-ink-300/40 bg-white text-ink-700 hover:bg-surface-bg"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button className="focus-ring flex items-center gap-2 rounded-xl2 border border-ink-300/40 bg-white py-1.5 pl-1.5 pr-3 hover:bg-surface-bg">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-[11px] font-semibold text-white">
            JO
          </div>
          <span className="hidden text-sm font-medium text-ink-900 sm:block">J. Okafor</span>
        </button>
      </div>
    </header>
  );
}
