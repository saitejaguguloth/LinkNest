"use client";

import { Bookmark } from "@/lib/types";
import BookmarkItem from "./BookmarkItem";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  isLoading: boolean;
  isDeletingId: string | null;
  error?: string;
  onRequestDelete: (bookmark: Bookmark) => void;
  onRequestEdit: (bookmark: Bookmark) => void;
  faviconsEnabled?: boolean;
}

function SkeletonCard() {
  return (
    <div className="ln-card p-5">
      <div className="ln-card-highlight" />
      <div className="relative h-4 w-3/4 rounded bg-slate-100 animate-shimmer" />
      <div className="relative mt-2 h-3 w-1/2 rounded bg-slate-100 animate-shimmer" />
      <div className="relative mt-6 h-9 w-24 rounded bg-slate-100 animate-shimmer" />
    </div>
  );
}

export default function BookmarkList({
  bookmarks,
  isLoading,
  isDeletingId,
  error,
  onRequestDelete,
  onRequestEdit,
  faviconsEnabled = true,
}: BookmarkListProps) {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {bookmarks.length === 0 ? (
        <div className="ln-card p-12 text-center">
          <div className="ln-card-highlight" />

          <div className="relative mx-auto h-20 w-20">
            <svg
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="ln-blob" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#4f46e5" stopOpacity="0.18" />
                  <stop offset="1" stopColor="#7c3aed" stopOpacity="0.12" />
                </linearGradient>
              </defs>
              <path
                fill="url(#ln-blob)"
                d="M40.6,-60.7C53.2,-54.1,64.6,-44.3,70.5,-31.8C76.4,-19.2,76.8,-4,72.9,10.4C69,24.8,60.8,38.4,49.5,48.9C38.2,59.5,23.7,67,7.5,72.2C-8.7,77.3,-26.6,80.1,-39.9,73.1C-53.3,66.2,-62.1,49.5,-68.1,33C-74.1,16.4,-77.4,0,-73.7,-14.9C-70,-29.9,-59.3,-43.4,-46.3,-50.2C-33.3,-57.1,-18.1,-57.2,-2.7,-53.2C12.7,-49.2,25.4,-72.4,40.6,-60.7Z"
                transform="translate(100 100)"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <path d="M5.25 3A2.25 2.25 0 0 0 3 5.25v11a.75.75 0 0 0 1.125.65L10 13.5l5.875 3.4A.75.75 0 0 0 17 16.25v-11A2.25 2.25 0 0 0 14.75 3h-9.5Z" />
              </svg>
            </div>
          </div>

          <p className="relative mt-8 text-xl font-semibold text-slate-900">
            No bookmarks yet
          </p>
          <p className="relative mt-2 text-sm text-slate-600">
            Start building your link workspace.
          </p>

          <div className="relative mt-6 flex justify-center">
            <a href="#add-bookmark" className="ln-btn-primary px-5 py-2.5">
              Add your first bookmark
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              onRequestDelete={onRequestDelete}
              onRequestEdit={onRequestEdit}
              isDeleting={isDeletingId === bookmark.id}
              faviconsEnabled={faviconsEnabled}
            />
          ))}
        </div>
      )}

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

