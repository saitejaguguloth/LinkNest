"use client";

import { createClient } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface NavbarProps {
  userName?: string;
  userEmail: string;
  avatarUrl?: string;
}

export default function Navbar({ userName, userEmail, avatarUrl }: NavbarProps) {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-3">
        <div className="flex items-center gap-3">
          <Image
            src="/linknest_logo.png"
            alt="LinkNest"
            width={520}
            height={136}
            className="h-[96px] w-auto"
            priority
          />

          <span className="hidden items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 sm:inline-flex">
            Live Sync
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="User avatar"
                width={32}
                height={32}
                className="rounded-xl border border-gray-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-medium text-indigo-600">
                {userEmail?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden min-w-0 sm:block">
              {userName ? (
                <p className="max-w-[220px] truncate text-sm font-medium text-gray-900">
                  {userName}
                </p>
              ) : null}
              <p className="max-w-[220px] truncate text-xs text-gray-500">
                {userEmail}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.99]"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

