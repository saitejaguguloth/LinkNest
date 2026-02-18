"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Command = {
  id: string;
  label: string;
  href?: string;
  action?: () => void;
};

const baseCommands: Omit<Command, "action">[] = [
  { id: "dashboard", label: "Go to Dashboard", href: "/dashboard" },
  { id: "bookmarks", label: "Go to Bookmarks", href: "/dashboard/bookmarks" },
  {
    id: "collections",
    label: "Go to Collections",
    href: "/dashboard/collections",
  },
  { id: "analytics", label: "Go to Analytics", href: "/dashboard/analytics" },
  { id: "profile", label: "Go to Profile", href: "/dashboard/profile" },
  { id: "settings", label: "Go to Settings", href: "/dashboard/settings" },
];

export default function CommandPalette({
  onRequestFocusSearch,
}: {
  onRequestFocusSearch?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = typeof e.key === "string" ? e.key : "";
      if (key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen(true);
      }
      if (key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const commands: Command[] = useMemo(() => {
    const focus: Command = {
      id: "focus-search",
      label: "Focus search",
      action: () => {
        onRequestFocusSearch?.();
      },
    };

    const all: Command[] = [
      focus,
      ...baseCommands.map((c) => {
        if (!c.href) return { ...c, action: undefined };
        const href: string = c.href;
        return {
          ...c,
          action: () => {
            router.push(href);
          },
        };
      }),
    ];

    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((c) => c.label.toLowerCase().includes(q));
  }, [onRequestFocusSearch, query, router]);

  const handleSelect = (cmd: Command) => {
    cmd.action?.();
    close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24">
      <button
        className="absolute inset-0 bg-black/30 animate-fade-in"
        onClick={close}
        aria-label="Close command palette"
      />

      <div className="relative w-full max-w-xl rounded-xl border border-gray-200 bg-white shadow-sm animate-modal-in">
        <div className="border-b border-gray-200 p-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands..."
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-2 text-xs text-gray-500">
            Tip: Press Ctrl+K anytime
          </p>
        </div>

        <div className="max-h-[320px] overflow-auto p-2">
          {commands.length === 0 ? (
            <p className="p-4 text-sm text-gray-600">No results.</p>
          ) : (
            <ul className="space-y-1">
              {commands.map((cmd) => {
                const isCurrent = cmd.href && pathname === cmd.href;
                return (
                  <li key={cmd.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(cmd)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-all duration-200 ease-out hover:bg-gray-50 ${
                        isCurrent ? "text-indigo-700" : "text-gray-700"
                      }`}
                    >
                      {cmd.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
