"use client";

import Link from "next/link";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-gray-900 dark:text-white bg-gray-50 dark:bg-[#222222]">
      <header className="bg-white dark:bg-[#222222] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0" title="Late homepage">
            <img
              src="https://getlate.dev/images/icon_light.svg"
              alt="Late logo"
              width={48}
              height={48}
              className="w-12 h-12 transition-transform duration-500 hover:rotate-[360deg] invert dark:invert-0"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white font-mono whitespace-nowrap">
              Late
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 justify-end flex-shrink-0">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
