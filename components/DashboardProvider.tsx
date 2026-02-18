"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface DashboardUser {
  userId: string;
  userEmail: string;
  userName?: string;
  avatarUrl?: string;
}

const DashboardContext = createContext<DashboardUser | null>(null);

export function DashboardProvider({
  value,
  children,
}: {
  value: DashboardUser;
  children: ReactNode;
}) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardUser() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardUser must be used within DashboardProvider");
  }
  return ctx;
}
