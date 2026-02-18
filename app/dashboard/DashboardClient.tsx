"use client";

import BookmarkForm from "@/components/BookmarkForm";
import BookmarkList from "@/components/BookmarkList";
import ConfirmDialog from "@/components/ConfirmDialog";
import EditBookmarkDialog from "@/components/EditBookmarkDialog";
import { useToast } from "@/components/ToastProvider";
import { useDashboardUser } from "@/components/DashboardProvider";
import { useSearchFocus } from "@/components/SearchFocus";
import { createClient } from "@/lib/supabaseClient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Bookmark } from "@/lib/types";
import { useSearchParams } from "next/navigation";

function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

type SortMode = "newest" | "oldest" | "az";

type LocalSettings = {
  realtimeEnabled: boolean;
  faviconsEnabled: boolean;
};

const settingsStorageKey = "linknest.settings";

function readLocalSettings(): LocalSettings {
  if (typeof window === "undefined") {
    return { realtimeEnabled: true, faviconsEnabled: true };
  }
  try {
    const raw = window.localStorage.getItem(settingsStorageKey);
    if (!raw) return { realtimeEnabled: true, faviconsEnabled: true };
    const parsed = JSON.parse(raw) as Partial<LocalSettings>;
    return {
      realtimeEnabled: parsed.realtimeEnabled ?? true,
      faviconsEnabled: parsed.faviconsEnabled ?? true,
    };
  } catch {
    return { realtimeEnabled: true, faviconsEnabled: true };
  }
}

function formatShortDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;

    if (from === to) {
      setDisplay(to);
      return;
    }

    const durationMs = 420;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (to - from) * eased);
      setDisplay(next);
      if (t < 1) raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [value]);

  return <>{display}</>;
}

export default function DashboardClient() {
  const supabase = useMemo(() => createClient(), []);
  const { userId, userEmail, userName } = useDashboardUser();
  const { pushToast } = useToast();
  const { register } = useSearchFocus();
  const searchParams = useSearchParams();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Bookmark | null>(null);
  const [editing, setEditing] = useState<Bookmark | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [settings, setSettings] = useState<LocalSettings>(() => ({
    realtimeEnabled: true,
    faviconsEnabled: true,
  }));

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const refetchTimer = useRef<number | null>(null);

  const fetchBookmarks = useCallback(async () => {
    setError(null);

    // Ensure the browser client has a fresh session before querying
    await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      devLog("Fetch bookmarks error", error);
      setError("Could not load bookmarks.");
      return;
    }

    setBookmarks((data ?? []) as Bookmark[]);
  }, [supabase, userId]);

  const scheduleRefetch = useCallback(() => {
    if (refetchTimer.current) window.clearTimeout(refetchTimer.current);
    refetchTimer.current = window.setTimeout(() => {
      fetchBookmarks();
    }, 600);
  }, [fetchBookmarks]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setSettings(readLocalSettings());
      await fetchBookmarks();
      if (mounted) setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [fetchBookmarks]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === settingsStorageKey) {
        setSettings(readLocalSettings());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    register(() => searchInputRef.current?.focus());
    return () => register(null);
  }, [register]);

  useEffect(() => {
    const tag = searchParams.get("tag");
    if (tag) {
      setSelectedTag(tag);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!settings.realtimeEnabled) return;
    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          try {
            if (payload.eventType === "INSERT") {
              const next = payload.new as Bookmark;
              setBookmarks((prev) => {
                if (prev.some((b) => b.id === next.id)) return prev;
                return [next, ...prev];
              });
              return;
            }

            if (payload.eventType === "UPDATE") {
              const next = payload.new as Bookmark;
              setBookmarks((prev) => prev.map((b) => (b.id === next.id ? next : b)));
              return;
            }

            if (payload.eventType === "DELETE") {
              const deletedId = payload.old.id as string;
              setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
              return;
            }
          } catch (err) {
            devLog("Realtime handler error", err);
            scheduleRefetch();
          }
        }
      )
      .subscribe((status) => {
        if (process.env.NODE_ENV === "development") {
          devLog("Realtime status", status);
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          scheduleRefetch();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scheduleRefetch, settings.realtimeEnabled, supabase, userId]);

  const handleAdded = useCallback((bookmark: Bookmark) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === bookmark.id)) return prev;
      return [bookmark, ...prev];
    });
  }, []);

  const requestDelete = useCallback((bookmark: Bookmark) => {
    setPendingDelete(bookmark);
  }, []);

  const requestEdit = useCallback((bookmark: Bookmark) => {
    setEditing(bookmark);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;

    const id = pendingDelete.id;
    setIsDeletingId(id);
    setPendingDelete(null);

    const previous = bookmarks;
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    try {
      await supabase.auth.getUser();
      const { error } = await supabase.from("bookmarks").delete().eq("id", id).eq("user_id", userId);
      if (error) {
        devLog("Delete bookmark error", error);
        setBookmarks(previous);
        setError("Could not delete bookmark.");
        pushToast({
          type: "error",
          title: "Delete failed",
          message: "Please try again.",
        });
        return;
      }
      pushToast({ type: "success", title: "Bookmark deleted" });
    } catch (err) {
      devLog("Delete bookmark exception", err);
      setBookmarks(previous);
      setError("Could not delete bookmark.");
      pushToast({
        type: "error",
        title: "Delete failed",
        message: "Please try again.",
      });
    } finally {
      setIsDeletingId(null);
    }
  }, [bookmarks, pendingDelete, pushToast, supabase]);

  const saveEdit = useCallback(
    async (next: { title: string; url: string; tags: string[] }) => {
      if (!editing) return;
      setIsSavingEdit(true);
      const id = editing.id;

      const previous = bookmarks;
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, title: next.title, url: next.url, tags: next.tags } : b
        )
      );

      try {
        // Ensure fresh session so RLS can verify ownership
        await supabase.auth.getUser();

        // Delete the old row, then re-insert with updated fields.
        // This bypasses PostgREST schema-cache issues with the tags column
        // since INSERT is confirmed to work with tags.
        const { error: delError } = await supabase
          .from("bookmarks")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (delError) {
          devLog("Edit (delete step) error", delError);
          setBookmarks(previous);
          pushToast({
            type: "error",
            title: "Update failed",
            message: delError.message || "Please try again.",
          });
          return;
        }

        const { data: inserted, error: insError } = await supabase
          .from("bookmarks")
          .insert({
            id,
            user_id: userId,
            title: next.title,
            url: next.url,
            tags: next.tags,
            created_at: editing.created_at,
          })
          .select("*")
          .single();

        if (insError) {
          devLog("Edit (insert step) error", insError);
          // Re-insert the original as a recovery attempt
          await supabase.from("bookmarks").insert({
            id: editing.id,
            user_id: userId,
            title: editing.title,
            url: editing.url,
            tags: editing.tags ?? [],
            created_at: editing.created_at,
          });
          setBookmarks(previous);
          pushToast({
            type: "error",
            title: "Update failed",
            message: insError.message || "Please try again.",
          });
          return;
        }

        if (inserted) {
          setBookmarks((prev) => prev.map((b) => (b.id === id ? (inserted as Bookmark) : b)));
        }
        pushToast({ type: "success", title: "Bookmark updated" });
        setEditing(null);
      } catch (err) {
        devLog("Edit bookmark exception", err);
        setBookmarks(previous);
        pushToast({
          type: "error",
          title: "Update failed",
          message: "Please try again.",
        });
      } finally {
        setIsSavingEdit(false);
      }
    },
    [bookmarks, editing, pushToast, supabase, userId]
  );

  const stats = useMemo(() => {
    const total = bookmarks.length;
    const now = new Date();
    const addedToday = bookmarks.reduce((count, b) => {
      const created = new Date(b.created_at);
      if (Number.isNaN(created.getTime())) return count;
      return isSameLocalDay(created, now) ? count + 1 : count;
    }, 0);

    const lastAdded = bookmarks
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

    return {
      total,
      addedToday,
      lastAddedLabel: lastAdded ? formatShortDate(lastAdded.created_at) : "—",
    };
  }, [bookmarks]);

  const visibleBookmarks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filteredByTag =
      selectedTag === "all"
        ? bookmarks
        : bookmarks.filter((b) =>
            Array.isArray(b.tags)
              ? b.tags.some(
                  (t) => String(t).trim().toLowerCase() === selectedTag.toLowerCase()
                )
              : false
          );

    const filteredByQuery = q
      ? filteredByTag.filter((b) => {
          const title = b.title?.toLowerCase() ?? "";
          const url = b.url?.toLowerCase() ?? "";
          return title.includes(q) || url.includes(q);
        })
      : filteredByTag;

    const sorted = filteredByQuery.slice();
    if (sortMode === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortMode === "az") {
      sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return sorted;
  }, [bookmarks, query, selectedTag, sortMode]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const b of bookmarks) {
      if (!Array.isArray(b.tags)) continue;
      for (const t of b.tags) {
        const tag = String(t).trim();
        if (!tag) continue;
        set.add(tag);
      }
    }
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  }, [bookmarks]);

  const greetingName = useMemo(() => {
    if (userName?.trim()) return userName.trim();
    if (userEmail?.includes("@")) return userEmail.split("@")[0];
    return "there";
  }, [userEmail, userName]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Bookmarks
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Welcome back, {greetingName}. Manage and organize your saved links.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="ln-card ln-card-hover border-t-4 border-t-indigo-500 p-6">
          <div className="ln-card-highlight" />
          <p className="relative text-sm text-slate-600">Total Links</p>
          <p className="relative mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            <AnimatedNumber value={stats.total} />
          </p>
        </div>
        <div className="ln-card ln-card-hover border-t-4 border-t-violet-500 p-6">
          <div className="ln-card-highlight" />
          <p className="relative text-sm text-slate-600">Added Today</p>
          <p className="relative mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            <AnimatedNumber value={stats.addedToday} />
          </p>
        </div>
        <div className="ln-card ln-card-hover border-t-4 border-t-sky-500 p-6">
          <div className="ln-card-highlight" />
          <p className="relative text-sm text-slate-600">Last Added</p>
          <p className="relative mt-3 text-lg font-medium text-slate-900">
            {stats.lastAddedLabel}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <BookmarkForm userId={userId} onAdded={handleAdded} />
      </section>

      <section className="mt-10">
        <div className="ln-card p-5">
          <div className="ln-card-highlight" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <label htmlFor="search" className="sr-only">
              Search bookmarks
            </label>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 1 0 3.37 9.85l2.64 2.65a.75.75 0 1 0 1.06-1.06l-2.65-2.64A5.5 5.5 0 0 0 9 3.5Zm-4 5.5A4 4 0 1 1 13 9a4 4 0 0 1-8 0Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                ref={searchInputRef}
                id="search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bookmarks..."
                className="ln-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <label htmlFor="tag" className="text-sm font-medium text-slate-600">
                Tag
              </label>
              <select
                id="tag"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="all">All</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm font-medium text-slate-600">
                Sort
              </label>
              <select
                id="sort"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="az">A–Z</option>
              </select>
            </div>
          </div>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Saved links</h2>
            <p className="mt-1 text-sm text-slate-600">
              {visibleBookmarks.length} result
              {visibleBookmarks.length === 1 ? "" : "s"}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Ctrl+K for navigation
          </p>
        </div>

        <div className="mt-4">
          <div
            key={`${query}::${selectedTag}::${sortMode}`}
            className="animate-fade-in"
          >
            <BookmarkList
              bookmarks={visibleBookmarks}
              isLoading={isLoading}
              isDeletingId={isDeletingId}
              error={error ?? undefined}
              onRequestDelete={requestDelete}
              onRequestEdit={requestEdit}
              faviconsEnabled={settings.faviconsEnabled}
            />
          </div>
        </div>
      </section>

      <EditBookmarkDialog
        open={!!editing}
        bookmark={editing}
        isSaving={isSavingEdit}
        onCancel={() => setEditing(null)}
        onSave={saveEdit}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete bookmark?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isConfirming={isDeletingId != null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

