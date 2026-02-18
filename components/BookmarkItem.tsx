"use client";

import { Bookmark } from "@/lib/types";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ToastProvider";

interface BookmarkItemProps {
  bookmark: Bookmark;
  onRequestDelete: (bookmark: Bookmark) => void;
  onRequestEdit: (bookmark: Bookmark) => void;
  isDeleting: boolean;
  faviconsEnabled?: boolean;
}

export default function BookmarkItem({
  bookmark,
  onRequestDelete,
  onRequestEdit,
  isDeleting,
  faviconsEnabled = true,
}: BookmarkItemProps) {
  const { pushToast } = useToast();
  const [faviconFailed, setFaviconFailed] = useState(false);

  const domain = useMemo(() => {
    try {
      return new URL(bookmark.url).hostname;
    } catch {
      return "";
    }
  }, [bookmark.url]);

  const faviconUrl = useMemo(() => {
    if (!domain) return "";
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }, [domain]);

  const tags = useMemo(() => {
    if (!Array.isArray(bookmark.tags)) return [];
    return bookmark.tags
      .map((t) => String(t).trim())
      .filter(Boolean)
      .slice(0, 3);
  }, [bookmark.tags]);

  const handleCopy = async () => {
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard not available");
      }
      await navigator.clipboard.writeText(bookmark.url);
      pushToast({
        type: "success",
        title: "Copied to clipboard",
      });
    } catch {
      pushToast({
        type: "error",
        title: "Copy failed",
        message: "Please copy the URL manually.",
      });
    }
  };

  return (
    <div className="ln-card ln-card-hover p-5 hover:border-indigo-200">
      <div className="ln-card-highlight" />
      <div className="flex items-start justify-between gap-3">
        <div className="relative flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            {faviconsEnabled && faviconUrl && !faviconFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={faviconUrl}
                alt=""
                className="h-4 w-4"
                loading="lazy"
                onError={() => setFaviconFailed(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              >
                <path d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm.75 4.25a.75.75 0 0 0-1.5 0v3.5c0 .2.08.39.22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06l-2.28-2.28V6.75Z" />
              </svg>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {bookmark.title}
            </h3>
            <p className="mt-1 truncate text-xs text-slate-600">
              {bookmark.url}
            </p>

            {tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t, idx) => (
                  <span
                    key={t}
                    className={idx % 2 === 0 ? "ln-pill-indigo" : "ln-pill-violet"}
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRequestEdit(bookmark)}
            className="rounded-xl p-2 text-slate-400 transition-all duration-200 ease-out hover:bg-slate-50 hover:text-slate-800 active:scale-95"
            aria-label="Edit bookmark"
            title="Edit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-8.25 8.25a1 1 0 0 1-.424.263l-3.25 1a1 1 0 0 1-1.263-1.263l1-3.25a1 1 0 0 1 .263-.424l8.25-8.25Z" />
              <path d="M11 4.5 15.5 9" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onRequestDelete(bookmark)}
            disabled={isDeleting}
            className="rounded-xl p-2 text-slate-400 transition-all duration-200 ease-out hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Delete bookmark"
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.75 3a.75.75 0 0 0-.75.75V4H5.5a.75.75 0 0 0 0 1.5h.43l.7 10.06A2.25 2.25 0 0 0 8.88 18h2.24a2.25 2.25 0 0 0 2.25-2.44l.7-10.06h.43a.75.75 0 0 0 0-1.5H12v-.25A.75.75 0 0 0 11.25 3h-2.5Zm.75 2.5h1V4.5h-1V5.5Zm-1.03 2.22a.75.75 0 0 1 .8.7l.4 6a.75.75 0 1 1-1.5.1l-.4-6a.75.75 0 0 1 .7-.8Zm3.06 0a.75.75 0 0 1 .7.8l-.4 6a.75.75 0 1 1-1.5-.1l.4-6a.75.75 0 0 1 .8-.7Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-2">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ln-btn-primary px-3 py-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0V4A6.75 6.75 0 0 0 16 10.75h1.25a.75.75 0 0 0 0-1.5H16A5.25 5.25 0 0 1 10.75 4V2.75Z" />
            <path d="M4 3.5A2.5 2.5 0 0 0 1.5 6v10A2.5 2.5 0 0 0 4 18.5h10A2.5 2.5 0 0 0 16.5 16v-4.25a.75.75 0 0 0-1.5 0V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4.25a.75.75 0 0 0 0-1.5H4Z" />
          </svg>
          Open
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="ln-btn-secondary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-slate-500"
            aria-hidden="true"
          >
            <path d="M6 2.75A2.75 2.75 0 0 1 8.75 0h5.5A2.75 2.75 0 0 1 17 2.75v5.5A2.75 2.75 0 0 1 14.25 11h-5.5A2.75 2.75 0 0 1 6 8.25v-5.5Z" />
            <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h.5v4.25A3.75 3.75 0 0 0 10 12h4.25v.5A2.75 2.75 0 0 1 11.5 15.25h-5.5A2.75 2.75 0 0 1 3.25 12.5v-5.75Z" />
          </svg>
          Copy
        </button>

        {isDeleting ? (
          <span className="text-xs text-slate-500">Deleting...</span>
        ) : null}
      </div>
    </div>
  );
}

