"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

export interface ToastInput {
  type: ToastType;
  title: string;
  message?: string;
}

interface Toast extends ToastInput {
  id: string;
}

interface ToastContextValue {
  pushToast: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function toastStyles(type: ToastType) {
  switch (type) {
    case "success":
      return {
        border: "border-indigo-200",
        bg: "bg-white",
        title: "text-gray-900",
        message: "text-gray-600",
      };
    case "error":
      return {
        border: "border-red-200",
        bg: "bg-white",
        title: "text-gray-900",
        message: "text-gray-600",
      };
    default:
      return {
        border: "border-gray-200",
        bg: "bg-white",
        title: "text-gray-900",
        message: "text-gray-600",
      };
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeout = timeouts.current.get(id);
    if (timeout) window.clearTimeout(timeout);
    timeouts.current.delete(id);
  }, []);

  const pushToast = useCallback(
    (toast: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      setToasts((prev) => [...prev, { ...toast, id }]);

      const timeout = window.setTimeout(() => removeToast(id), 3200);
      timeouts.current.set(id, timeout);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-3">
        {toasts.map((toast) => {
          const styles = toastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`w-[320px] rounded-xl border ${styles.border} ${styles.bg} p-4 shadow-sm animate-slide-up`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`truncate text-sm font-semibold ${styles.title}`}>
                    {toast.title}
                  </p>
                  {toast.message ? (
                    <p className={`mt-1 text-sm ${styles.message}`}>
                      {toast.message}
                    </p>
                  ) : null}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="rounded-md p-1 text-gray-500 transition-all duration-200 ease-out hover:bg-black/5 hover:text-gray-700"
                  aria-label="Dismiss notification"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
