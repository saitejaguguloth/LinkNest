"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M3 3.75A.75.75 0 0 1 3.75 3h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5A.75.75 0 0 1 3 7.25v-3.5ZM12 3.75A.75.75 0 0 1 12.75 3h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5A.75.75 0 0 1 12 7.25v-3.5ZM3 12.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1-.75-.75v-3.5ZM12 12.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1-.75-.75v-3.5Z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/bookmarks",
    label: "Bookmarks",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M5.25 3A2.25 2.25 0 0 0 3 5.25v11a.75.75 0 0 0 1.125.65L10 13.5l5.875 3.4A.75.75 0 0 0 17 16.25v-11A2.25 2.25 0 0 0 14.75 3h-9.5Z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/collections",
    label: "Collections",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M6 3.75A.75.75 0 0 1 6.75 3h6.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75h-6.5A.75.75 0 0 1 6 6.25v-2.5Z" />
        <path
          fillRule="evenodd"
          d="M3 8.75A.75.75 0 0 1 3.75 8h12.5a.75.75 0 0 1 .75.75v7A2.25 2.25 0 0 1 14.75 18h-9.5A2.25 2.25 0 0 1 3 15.75v-7ZM7.25 12a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm8.75-4.75a.75.75 0 0 0-1.5 0v4.19c0 .2.08.39.22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06L10.75 9.19V5.25Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 2.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM5 14.5a5 5 0 0 1 10 0v.25a.75.75 0 0 1-.75.75H5.75A.75.75 0 0 1 5 14.75v-.25Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M7.5 1.75A.75.75 0 0 1 8.25 1h3.5a.75.75 0 0 1 .75.75v.59a6.98 6.98 0 0 1 1.31.54l.42-.42a.75.75 0 0 1 1.06 0l2.47 2.47a.75.75 0 0 1 0 1.06l-.42.42c.22.41.4.85.54 1.31h.59a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-.59a6.98 6.98 0 0 1-.54 1.31l.42.42a.75.75 0 0 1 0 1.06l-2.47 2.47a.75.75 0 0 1-1.06 0l-.42-.42a6.98 6.98 0 0 1-1.31.54v.59a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1-.75-.75v-.59a6.98 6.98 0 0 1-1.31-.54l-.42.42a.75.75 0 0 1-1.06 0L2.47 17.6a.75.75 0 0 1 0-1.06l.42-.42a6.98 6.98 0 0 1-.54-1.31H1.75A.75.75 0 0 1 1 14.06v-3.5a.75.75 0 0 1 .75-.75h.59c.14-.46.32-.9.54-1.31l-.42-.42a.75.75 0 0 1 0-1.06L4.93 2.55a.75.75 0 0 1 1.06 0l.42.42c.41-.22.85-.4 1.31-.54v-.59ZM10 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href;
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="group hidden shrink-0 border-r border-slate-200 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.03)] transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:block w-[72px] hover:w-60 overflow-hidden">
      <div className="flex h-full flex-col px-4 py-6 overflow-hidden">
        <div className="flex items-center justify-center group-hover:justify-start">
          <Image
            src="/linknest_logo.png"
            alt="LinkNest"
            width={520}
            height={136}
            className="w-full max-w-[160px] h-auto transition-all duration-300 ease-out"
            priority
          />
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const active = pathname ? isActive(pathname, item.href) : false;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group/item relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ease-out group-hover:justify-start justify-center ${
                  active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span
                  className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-all duration-300 ease-out ${
                    active
                      ? "bg-indigo-500 opacity-100"
                      : "bg-violet-500 opacity-0 group-hover/item:opacity-100"
                  }`}
                  aria-hidden="true"
                />

                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-md border transition-all duration-300 ease-out ${
                    active
                      ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                      : "border-slate-200 bg-slate-50 text-slate-600 group-hover/item:bg-white"
                  }`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span
                  className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-out ${
                    active ? "text-indigo-600" : ""
                  } max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm group-hover:block">
            <p className="text-xs font-medium text-slate-900">Live Sync</p>
            <p className="mt-1 text-xs text-slate-600">
              Updates appear instantly across tabs.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
