"use client";

import { createClient } from "@/lib/supabaseClient";
import { useDashboardUser } from "@/components/DashboardProvider";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Bookmark } from "@/lib/types";

export const dynamic = "force-dynamic";

type TagRow = {
  tag: string;
  count: number;
};

export default function CollectionsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { userId } = useDashboardUser();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError(null);

      // Ensure the browser client has a fresh session before querying
      const { error: userError } = await supabase.auth.getUser();
      if (!mounted) return;
      if (userError) {
        setError("Could not verify session. Please sign in again.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .select("id,tags,user_id")
        .eq("user_id", userId);

      if (!mounted) return;

      if (error) {
        setError("Could not load collections.");
        setIsLoading(false);
        return;
      }

      setBookmarks((data ?? []) as Bookmark[]);
      setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [supabase, userId]);

  const tags = useMemo((): TagRow[] => {
    const counts = new Map<string, number>();
    for (const b of bookmarks) {
      const t = Array.isArray(b.tags) ? b.tags : [];
      for (const raw of t) {
        const tag = String(raw).trim();
        if (!tag) continue;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [bookmarks]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Collections
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Browse links grouped by tag.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="h-4 w-1/2 rounded bg-gray-100 animate-shimmer" />
              <div className="mt-4 h-8 w-24 rounded bg-gray-100 animate-shimmer" />
            </div>
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200 bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-7 w-7 text-gray-500"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6.75V5.25A2.25 2.25 0 0 1 11.25 3h7.5A2.25 2.25 0 0 1 21 5.25v7.5A2.25 2.25 0 0 1 18.75 15H17.25"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9.75A2.25 2.25 0 0 1 5.25 7.5h7.5A2.25 2.25 0 0 1 15 9.75v7.5A2.25 2.25 0 0 1 12.75 19.5h-7.5A2.25 2.25 0 0 1 3 17.25v-7.5Z"
              />
            </svg>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-900">
            No collections yet
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Add tags to bookmarks to organize them into collections.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-out hover:bg-indigo-700 active:scale-[0.99]"
            >
              Go to Bookmarks
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((t) => (
            <Link
              key={t.tag}
              href={`/dashboard/bookmarks?tag=${encodeURIComponent(t.tag)}`}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-lg font-medium text-gray-900">{t.tag}</p>
              <p className="mt-2 text-sm text-gray-600">{t.count} link{t.count === 1 ? "" : "s"}</p>
            </Link>
          ))}
        </div>
      )}

      {error ? (
        <p className="mt-6 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
