"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import CommandPalette from "@/components/CommandPalette";
import Image from "next/image";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useDashboardUser } from "@/components/DashboardProvider";
import { SearchFocusProvider, useSearchFocus } from "@/components/SearchFocus";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const { userEmail, userName, avatarUrl } = useDashboardUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <SearchFocusProvider>
      <ShellInner
        userEmail={userEmail}
        userName={userName}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
      >
        {children}
      </ShellInner>
    </SearchFocusProvider>
  );
}

function ShellInner({
  userEmail,
  userName,
  avatarUrl,
  onLogout,
  children,
}: {
  userEmail: string;
  userName?: string;
  avatarUrl?: string;
  onLogout: () => void;
  children: ReactNode;
}) {
  const { focus } = useSearchFocus();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      const target = e.target as Node;
      if (!menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = typeof e.key === "string" ? e.key : "";
      if (key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <CommandPalette onRequestFocusSearch={focus} />

      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 h-14 border-b border-slate-200 bg-transparent">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-end px-6">
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-2 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 ease-out hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-95"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="User avatar"
                      width={28}
                      height={28}
                      className="rounded-full border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-indigo-600">
                      {userEmail?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span className="hidden max-w-[220px] truncate sm:inline">
                    {userName?.trim() || userEmail}
                  </span>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)] animate-slide-up"
                  >
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {userName?.trim() || "Account"}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 truncate">
                        {userEmail}
                      </p>
                    </div>

                    <div className="h-px bg-slate-200" />

                    <button
                      role="menuitem"
                      onClick={onLogout}
                      className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
                    >
                      Logout
                      <span className="text-xs text-slate-400">Esc</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-8 py-10 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
