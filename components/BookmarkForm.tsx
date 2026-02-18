"use client";

import { useCallback, useMemo, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useToast } from "@/components/ToastProvider";
import type { Bookmark } from "@/lib/types";

interface BookmarkFormProps {
  userId: string;
  onAdded: (bookmark: Bookmark) => void;
}

function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function parseTags(input: string) {
  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const t of parts) {
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(t);
  }
  return unique;
}

export default function BookmarkForm({ userId, onAdded }: BookmarkFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const { pushToast } = useToast();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nextTitle = title.trim();
    const nextUrl = normalizeUrl(url);
    const nextTags = parseTags(tagsText);

    if (!nextTitle) {
      setError("Title is required.");
      return;
    }

    if (!nextUrl) {
      setError("URL is required.");
      return;
    }

    if (!isValidUrl(nextUrl)) {
      setError("Please enter a valid URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        devLog("Supabase getUser error", userError);
        throw new Error("Authentication error");
      }

      const sessionUserId = user?.id;
      if (!sessionUserId) {
        throw new Error("Not authenticated");
      }

      const insertUserId = sessionUserId;
      if (insertUserId !== userId) {
        devLog("User id mismatch", { userIdProp: userId, sessionUserId });
      }

      const { data, error: insertError } = await supabase
        .from("bookmarks")
        .insert([
          {
            user_id: insertUserId,
            title: nextTitle,
            url: nextUrl,
            tags: nextTags,
          },
        ])
        .select("*")
        .single();

      if (insertError) {
        devLog("Supabase insert error", insertError);
        throw insertError;
      }

      if (!data) {
        devLog("Insert returned no data");
        throw new Error("Insert returned no data");
      }

      onAdded(data as Bookmark);
      pushToast({ type: "success", title: "Bookmark added successfully" });
      setTitle("");
      setUrl("");
      setTagsText("");
    } catch (err) {
      devLog("Add bookmark failed", err);
      setError(
        "Could not add bookmark. Please confirm you are signed in and try again."
      );
      pushToast({
        type: "error",
        title: "Something went wrong",
        message: "Could not add bookmark.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [onAdded, pushToast, supabase, title, url, userId]);

  return (
    <div id="add-bookmark" className="ln-card p-6">
      <div className="ln-card-highlight" />
      <h2 className="relative text-lg font-semibold text-slate-900">Add bookmark</h2>
      <p className="relative mt-1 text-sm text-slate-600">
        Save a link to keep it available across devices.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Next.js documentation"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-inner transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label
            htmlFor="url"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-inner transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label
            htmlFor="tags"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="work, research, tools"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-inner transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <p className="mt-1 text-xs text-slate-500">Comma-separated</p>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="ln-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && (
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {isSubmitting ? "Adding" : "Add Bookmark"}
        </button>
      </form>
    </div>
  );
}

