"use client";

import { createClient } from "@/lib/supabaseClient";
import { useDashboardUser } from "@/components/DashboardProvider";
import { useEffect, useMemo, useState } from "react";
import type { Bookmark } from "@/lib/types";

export const dynamic = "force-dynamic";

type DomainRow = { domain: string; count: number };

function extractDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function isWithinLastDays(iso: string, days: number) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const ms = days * 24 * 60 * 60 * 1000;
  return now.getTime() - d.getTime() <= ms;
}

export default function AnalyticsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { userId } = useDashboardUser();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError(null);
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id,url,created_at,user_id")
        .eq("user_id", userId);

      if (!mounted) return;

      if (error) {
        setError("Could not load analytics.");
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

  const computed = useMemo(() => {
    const total = bookmarks.length;
    const recent7 = bookmarks.filter((b) => isWithinLastDays(b.created_at, 7)).length;

    const domainCounts = new Map<string, number>();
    for (const b of bookmarks) {
      const domain = extractDomain(b.url);
      if (!domain) continue;
      domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + 1);
    }

    const domains: DomainRow[] = Array.from(domainCounts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain));

    return {
      total,
      recent7,
      uniqueDomains: domainCounts.size,
      topDomains: domains.slice(0, 5),
      topDomainLabel: domains[0]?.domain ?? "—",
    };
  }, [bookmarks]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          A quick view into your saved link activity.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="h-4 w-1/3 rounded bg-gray-100 animate-shimmer" />
              <div className="mt-4 h-10 w-1/2 rounded bg-gray-100 animate-shimmer" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
              <p className="text-sm text-gray-500">Total Links</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
                {computed.total}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
              <p className="text-sm text-gray-500">Added (7 days)</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
                {computed.recent7}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
              <p className="text-sm text-gray-500">Top Domain</p>
              <p className="mt-3 text-lg font-medium text-gray-900">
                {computed.topDomainLabel}
              </p>
            </div>
          </section>

          <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Top domains</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Most frequent sources in your workspace.
                </p>
              </div>
              <p className="text-sm text-gray-500">
                {computed.uniqueDomains} unique
              </p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2 pr-4 font-medium">Domain</th>
                    <th className="py-2 text-right font-medium">Links</th>
                  </tr>
                </thead>
                <tbody>
                  {computed.topDomains.length === 0 ? (
                    <tr>
                      <td className="py-4 text-gray-600" colSpan={2}>
                        No domains yet.
                      </td>
                    </tr>
                  ) : (
                    computed.topDomains.map((row) => (
                      <tr key={row.domain} className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {row.domain}
                        </td>
                        <td className="py-3 text-right text-gray-600">
                          {row.count}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {error ? (
        <p className="mt-6 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
