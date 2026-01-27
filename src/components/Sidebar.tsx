"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Link as LinkIcon,
  Key,
  BarChart3,
  Inbox,
  Database,
  Users,
  Zap,
  FileCode,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { href: "/dashboard/posts", label: "Posts", icon: FileText },
  { href: "/dashboard/connections", label: "Connections", icon: LinkIcon },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:block sticky top-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="font-bold text-gray-900 dark:text-white mb-4 font-mono">
        Dashboard
      </h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2 text-sm font-mono text-yellow-600 dark:text-yellow-300">
            MAIN
          </h3>
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`w-full text-left text-sm font-mono transition-colors flex items-center gap-2 ${
                      isActive
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {/* <li>
              <button
                className="w-full text-left text-sm font-mono transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </li> */}
            {/* <li>
              <button
                className="w-full text-left text-sm font-mono transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <Inbox className="w-4 h-4" />
                Inbox
              </button>
            </li> */}
            {/* <li>
              <button
                className="w-full text-left text-sm font-mono transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <Database className="w-4 h-4" />
                Queues
              </button>
            </li> */}
            {/* <li>
              <button
                className="w-full text-left text-sm font-mono transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <Users className="w-4 h-4" />
                Users
              </button>
            </li> */}
            <li>
              <button
                className="w-full text-left text-sm font-mono transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <Zap className="w-4 h-4" />
                Webhooks
              </button>
            </li>
            {/* <li>
              <button
                className="w-full text-left text-sm font-mono transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <FileCode className="w-4 h-4" />
                Logs
              </button>
            </li> */}
          </ul>
        </div>

        {/* <div>
          <h3 className="font-semibold mb-2 text-sm font-mono text-yellow-600 dark:text-yellow-300">
            ACTIVE
          </h3>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div className="font-mono text-gray-900 dark:text-white text-sm">
              Connections
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 font-mono">
              platform integrations
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm font-mono text-yellow-600 dark:text-yellow-300">
              USAGE
            </h3>
            <span className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
              Free
            </span>
          </div>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                Uploads
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                0/10
              </span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-500 rounded-full h-2 mb-1">
              <div
                className="h-2 rounded-full transition-all duration-300 bg-green-500"
                style={{ width: "0%" }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              Resets on Feb 25, 2026
            </div>
          </div>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                Profiles
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                1/2
              </span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-500 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300 bg-green-500"
                style={{ width: "50%" }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-100 dark:from-purple-900/30 to-blue-100 dark:to-blue-900/30 rounded-lg p-3 border border-purple-300 dark:border-purple-500/20">
          <h3 className="font-semibold text-sm font-mono text-yellow-600 dark:text-yellow-300 mb-3">
            UPGRADE
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-1.5 font-mono">
                120 posts/month • 10 profiles
              </p>
              <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-md font-semibold font-mono text-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
                Build — $19/mo
              </button>
            </div>
            <div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-1.5 font-mono">
                Unlimited posts • 50 profiles
              </p>
              <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-md font-semibold font-mono text-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
                Accelerate — $49/mo
              </button>
            </div>
          </div>
        </div> */}

        <div>
          <h3 className="font-semibold mb-2 text-sm font-mono text-yellow-600 dark:text-yellow-300">
            RESOURCES
          </h3>
          <ul className="space-y-1">
            <li>
              <a
                href="https://docs.getlate.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-left text-sm font-mono text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <FileCode className="w-4 h-4" />
                API Docs
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
