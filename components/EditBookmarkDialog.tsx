"use client";

import { useEffect, useMemo, useState } from "react";
import type { Bookmark } from "@/lib/types";

interface EditBookmarkDialogProps {
  open: boolean;
  bookmark: Bookmark | null;
  isSaving?: boolean;
  onCancel: () => void;
  onSave: (next: { title: string; url: string; tags: string[] }) => void;
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

export default function EditBookmarkDialog({
  open,
  bookmark,
  isSaving = false,
  onCancel,
  onSave,
}: EditBookmarkDialogProps) {
  const initial = useMemo(() => {
    const title = bookmark?.title ?? "";
    const url = bookmark?.url ?? "";
    const tags = Array.isArray(bookmark?.tags) ? bookmark?.tags ?? [] : [];
    return {
      title,
      url,
      tagsText: tags.join(", "),
    };
  }, [bookmark]);

  const [title, setTitle] = useState(initial.title);
  const [url, setUrl] = useState(initial.url);
  const [tagsText, setTagsText] = useState(initial.tagsText);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial.title);
    setUrl(initial.url);
    setTagsText(initial.tagsText);
    setError(null);
  }, [initial, open]);

  if (!open || !bookmark) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

    onSave({ title: nextTitle, url: nextUrl, tags: nextTags });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <button
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onCancel}
        aria-label="Close edit dialog"
      />

      <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-modal-in">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Edit bookmark</h3>
            <p className="mt-1 text-sm text-gray-600">
              Update details for this saved link.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="edit-title">
              Title
            </label>
            <input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Bookmark title"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="edit-url">
              URL
            </label>
            <input
              id="edit-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="edit-tags">
              Tags
            </label>
            <input
              id="edit-tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="work, research, tools"
            />
            <p className="mt-1 text-xs text-gray-500">Comma-separated</p>
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.99]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-out hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.99]"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
