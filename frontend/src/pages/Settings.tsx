import { useState, useEffect } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/common/Button";
import { useDemo } from "../context/DemoContext";
import { NotificationCenter, useToast } from "../components/common/NotificationCenter";
import { MonitorPlay, Database, Bell, Save } from "lucide-react";

const STORAGE_KEY = "ai-flags-settings";

interface AppSettings {
  qualityThreshold: number;
  pollingInterval: number;
  slackWebhook: string;
  slackChannel: string;
  defaultRolloutStages: string;
  judgeProvider: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  qualityThreshold: 4.0,
  pollingInterval: 5000,
  slackWebhook: "",
  slackChannel: "#ai-platform-alerts",
  defaultRolloutStages: "1% → 5% → 25% → 50% → 100%",
  judgeProvider: "mock",
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

function saveSettings(s: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function SettingsPage() {
  const { enabled: demoEnabled, toggle: toggleDemo } = useDemo();
  const { toasts, addToast, dismiss } = useToast();
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AppSettings>({ ...settings });

  useEffect(() => { setForm({ ...settings }); }, [settings]);

  const handleSave = () => {
    saveSettings(form);
    setSettings({ ...form });
    setEditing(false);
    addToast("success", "Settings Saved", "Configuration has been updated.");
  };

  const handleReset = () => {
    saveSettings(DEFAULT_SETTINGS);
    setSettings({ ...DEFAULT_SETTINGS });
    setForm({ ...DEFAULT_SETTINGS });
    addToast("info", "Settings Reset", "Defaults restored.");
  };

  return (
    <div>
      <PageHeader title="Settings" description="Defaults applied to new feature flags and rollouts." />

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl2 ${demoEnabled ? "bg-success-50" : "bg-ink-300/20"}`}>
              <MonitorPlay className={`h-5 w-5 ${demoEnabled ? "text-success" : "text-ink-500"}`} />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-ink-900">Demo Mode</h3>
              <p className="text-xs text-ink-500">Animate dashboard with live data</p>
            </div>
          </div>
          <button
            onClick={toggleDemo}
            className={`focus-ring w-full rounded-xl2 px-4 py-2.5 text-sm font-medium transition-colors ${
              demoEnabled
                ? "bg-success text-white hover:bg-green-600"
                : "bg-surface-bg text-ink-700 hover:bg-ink-300/20"
            }`}
          >
            {demoEnabled ? "Disable Demo Mode" : "Enable Demo Mode"}
          </button>
          {demoEnabled && (
            <p className="mt-2 text-xs text-success">
              Demo mode active — dashboard is now animated with live data.
            </p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl2 bg-primary-50">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-ink-900">API Configuration</h3>
              <p className="text-xs text-ink-500">Backend API connectivity</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl2 bg-surface-bg px-3 py-2 text-sm">
              <span className="text-ink-500">Endpoint</span>
              <span className="text-ink-700 font-mono text-xs">
                {import.meta.env.VITE_API_URL || "http://localhost:8000"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl2 bg-surface-bg px-3 py-2 text-sm">
              <span className="text-ink-500">Mode</span>
              <span className="inline-flex items-center gap-1 rounded-pill bg-success-50 px-2 py-0.5 text-xs font-medium text-success">
                Live
              </span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl2 bg-success-50">
              <Bell className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-ink-900">Notifications</h3>
              <p className="text-xs text-ink-500">Slack and system alerts</p>
            </div>
          </div>
          <div className="space-y-2">
            {editing ? (
              <input
                value={form.slackChannel}
                onChange={(e) => setForm({ ...form, slackChannel: e.target.value })}
                className="focus-ring w-full rounded-xl2 border border-ink-300/40 bg-white px-3 py-2 text-sm"
                placeholder="#channel"
              />
            ) : (
              <div className="flex items-center justify-between rounded-xl2 bg-surface-bg px-3 py-2 text-sm">
                <span className="text-ink-500">Slack Channel</span>
                <span className="text-ink-700 font-mono text-xs">{settings.slackChannel}</span>
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl2 bg-surface-bg px-3 py-2 text-sm">
              <span className="text-ink-500">Status</span>
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="card divide-y divide-ink-300/10">
          <div className="p-5">
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Quality Threshold <span className="text-ink-500">({form.qualityThreshold.toFixed(1)})</span>
            </label>
            <input type="range" min={0} max={5} step={0.1} value={form.qualityThreshold} onChange={(e) => setForm({ ...form, qualityThreshold: Number(e.target.value) })} className="w-full" />
          </div>
          <div className="flex items-center justify-between p-5">
            <span className="text-sm text-ink-700">Polling Interval (ms)</span>
            <input type="number" value={form.pollingInterval} onChange={(e) => setForm({ ...form, pollingInterval: Number(e.target.value) })} className="focus-ring w-24 rounded-xl2 border border-ink-300/40 bg-white px-3 py-1.5 text-sm text-right" min={1000} step={1000} />
          </div>
          <div className="flex items-center justify-between p-5">
            <span className="text-sm text-ink-700">Slack Webhook URL</span>
            <input value={form.slackWebhook} onChange={(e) => setForm({ ...form, slackWebhook: e.target.value })} className="focus-ring w-64 rounded-xl2 border border-ink-300/40 bg-white px-3 py-1.5 text-sm" placeholder="https://hooks.slack.com/..." />
          </div>
          <div className="flex items-center justify-between p-5">
            <span className="text-sm text-ink-700">Judge Provider</span>
            <select value={form.judgeProvider} onChange={(e) => setForm({ ...form, judgeProvider: e.target.value })} className="focus-ring rounded-xl2 border border-ink-300/40 bg-white px-3 py-1.5 text-sm">
              <option value="mock">Mock</option>
              <option value="openrouter">OpenRouter</option>
              <option value="claude">Claude</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="card divide-y divide-ink-300/10">
          <div className="flex items-center justify-between p-5">
            <span className="text-sm text-ink-700">Default quality threshold</span>
            <span className="text-sm font-medium text-ink-900">{settings.qualityThreshold.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between p-5">
            <span className="text-sm text-ink-700">Rollout stages</span>
            <span className="text-sm font-medium text-ink-900">{settings.defaultRolloutStages}</span>
          </div>
          <div className="flex items-center justify-between p-5">
            <span className="text-sm text-ink-700">Polling interval</span>
            <span className="text-sm font-medium text-ink-900">{settings.pollingInterval}ms</span>
          </div>
          <div className="flex items-center justify-between p-5">
            <span className="text-sm text-ink-700">Judge provider</span>
            <span className="text-sm font-medium text-ink-900 capitalize">{settings.judgeProvider}</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {editing ? (
          <>
            <Button variant="primary" size="sm" icon={<Save className="h-4 w-4" />} onClick={handleSave}>Save Changes</Button>
            <Button variant="ghost" size="sm" onClick={() => { setForm({ ...settings }); setEditing(false); }}>Cancel</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit defaults</Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>Reset to defaults</Button>
          </>
        )}
      </div>

      <NotificationCenter toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
