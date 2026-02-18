"use client";

import { useDashboardUser } from "@/components/DashboardProvider";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const { userId, userEmail, userName } = useDashboardUser();

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Profile
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Your account details.
        </p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {userName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{userEmail}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 break-all text-sm text-gray-900">{userId}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Sign out from the header menu.
      </p>
    </div>
  );
}
