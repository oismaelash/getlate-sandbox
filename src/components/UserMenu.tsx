"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative z-10" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg transition-all duration-200 text-gray-900 dark:text-white focus-ring"
        type="button"
        aria-expanded={isOpen}
      >
        <img
          src="https://lh3.googleusercontent.com/a/ACg8ocL-FuqoExyaDvHP3j2tFNtrmYkZa7uRr-dYWCHaZmo8axW2mEd6jg=s96-c"
          alt="Ismael"
          className="w-8 h-8 rounded-full shrink-0 border border-gray-300 dark:border-gray-600"
          referrerPolicy="no-referrer"
          width="32"
          height="32"
        />
        <div className="flex items-center gap-2">
          <span className="font-medium font-mono text-sm">Ismael</span>
          <ChevronDown
            className={`w-4 h-4 duration-200 text-gray-500 dark:text-gray-400 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <button
            onClick={() => {
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-mono"
          >
            Profile
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-mono"
          >
            Settings
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          <button
            onClick={() => {
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-mono"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
