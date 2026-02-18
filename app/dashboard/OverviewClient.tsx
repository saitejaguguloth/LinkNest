"use client";

import Link from "next/link";
import { useDashboardUser } from "@/components/DashboardProvider";

export default function OverviewClient() {
  const { userEmail, userName } = useDashboardUser();

  const greetingName = userName?.trim()
    ? userName.trim()
    : userEmail?.includes("@")
      ? userEmail.split("@")[0]
      : "there";

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {greetingName}. Use the sidebar or Ctrl+K to navigate.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link
          href="/dashboard/bookmarks"
          className="ln-card ln-card-hover p-6 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <div className="ln-card-highlight" />
          <p className="relative text-sm font-semibold text-slate-900">Open Bookmarks</p>
          <p className="relative mt-1 text-sm text-slate-600">
            Add, search, tag, edit, and delete your saved links.
          </p>
        </Link>

        <Link
          href="/dashboard/collections"
          className="ln-card ln-card-hover p-6 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <div className="ln-card-highlight" />
          <p className="relative text-sm font-semibold text-slate-900">View Collections</p>
          <p className="relative mt-1 text-sm text-slate-600">
            Browse tag-based collections and jump into a filtered view.
          </p>
        </Link>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        <div className="ln-card-highlight" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 text-indigo-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 2a7 7 0 0 0-3.49 13.07c.55.31.99.86 1.11 1.52l.08.41h4.6l.08-.41c.12-.66.56-1.21 1.11-1.52A7 7 0 0 0 10 2Zm-1.5 13.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm.5-3.19a.75.75 0 0 1 .72-.82h.56a.75.75 0 0 1 .72.82l-.15 1.5a.75.75 0 0 1-.75.68h-.2a.75.75 0 0 1-.75-.68l-.15-1.5Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Quick tips</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li>Use Ctrl+K to open the command palette.</li>
          <li>Manage realtime + favicons in Settings.</li>
        </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
