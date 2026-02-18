"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type SearchFocusContextValue = {
  register: (fn: (() => void) | null) => void;
  focus: () => void;
};

const SearchFocusContext = createContext<SearchFocusContextValue | null>(null);

export function SearchFocusProvider({ children }: { children: ReactNode }) {
  const focusFnRef = useRef<(() => void) | null>(null);

  const register = useCallback((fn: (() => void) | null) => {
    focusFnRef.current = fn;
  }, []);

  const focus = useCallback(() => {
    focusFnRef.current?.();
  }, []);

  const value = useMemo(() => ({ register, focus }), [focus, register]);

  return (
    <SearchFocusContext.Provider value={value}>
      {children}
    </SearchFocusContext.Provider>
  );
}

export function useSearchFocus() {
  const ctx = useContext(SearchFocusContext);
  if (!ctx) {
    throw new Error("useSearchFocus must be used within SearchFocusProvider");
  }
  return ctx;
}
