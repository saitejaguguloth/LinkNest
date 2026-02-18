"use client";

import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

type SettingsState = {
  realtimeEnabled: boolean;
  faviconsEnabled: boolean;
};

const storageKey = "linknest.settings";

function readSettings(): SettingsState {
  if (typeof window === "undefined") {
    return { realtimeEnabled: true, faviconsEnabled: true };
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return { realtimeEnabled: true, faviconsEnabled: true };
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return {
      realtimeEnabled: parsed.realtimeEnabled ?? true,
      faviconsEnabled: parsed.faviconsEnabled ?? true,
    };
  } catch {
    return { realtimeEnabled: true, faviconsEnabled: true };
  }
}

function writeSettings(next: SettingsState) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          checked
            ? "border-indigo-200 bg-indigo-50"
            : "border-gray-300 bg-white"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-all duration-200 ease-out ${
            checked ? "translate-x-6 border border-indigo-200" : "translate-x-0 border border-gray-200"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    realtimeEnabled: true,
    faviconsEnabled: true,
  });

  useEffect(() => {
    setSettings(readSettings());
  }, []);

  useEffect(() => {
    writeSettings(settings);
  }, [settings]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Customize how your workspace behaves on this device.
        </p>
      </header>

      <div className="space-y-4">
        <ToggleRow
          label="Realtime sync"
          description="Apply updates instantly across tabs."
          checked={settings.realtimeEnabled}
          onChange={(realtimeEnabled) =>
            setSettings((s) => ({ ...s, realtimeEnabled }))
          }
        />
        <ToggleRow
          label="Favicons"
          description="Show site icons in bookmark cards."
          checked={settings.faviconsEnabled}
          onChange={(faviconsEnabled) =>
            setSettings((s) => ({ ...s, faviconsEnabled }))
          }
        />
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Settings are stored locally in your browser.
      </p>
    </div>
  );
}
