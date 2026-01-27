"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { X, ChevronDown, Search, Check, Filter, Calendar, Users } from "lucide-react";
import { inferContentType, type MediaItem } from "@/lib/post-utils";

interface Profile {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

interface Account {
  _id: string;
  platform: string;
  username: string | null;
  displayName?: string | null;
  profilePicture?: string | null;
  metadata?: {
    profilePicture?: string | null;
  };
  profile: {
    _id?: string;
    name: string;
  };
}

const PLATFORMS = [
  {
    id: "tiktok",
    name: "TikTok",
    colorClass: "text-pink-700",
    icon: <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path>
  },
  {
    id: "instagram",
    name: "Instagram",
    colorClass: "text-purple-700",
    icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
  },
  {
    id: "facebook",
    name: "Facebook",
    colorClass: "text-blue-700",
    icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
  },
  {
    id: "youtube",
    name: "YouTube",
    colorClass: "text-[#FF0000]",
    icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    colorClass: "text-blue-700",
    icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
  },
  {
    id: "twitter",
    name: "Twitter/X",
    colorClass: "text-sky-700",
    icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  },
  {
    id: "threads",
    name: "Threads",
    colorClass: "text-gray-700",
    icon: <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"></path>
  },
  {
    id: "pinterest",
    name: "Pinterest",
    colorClass: "text-rose-700",
    icon: <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"></path>
  },
  {
    id: "reddit",
    name: "Reddit",
    colorClass: "text-orange-700",
    icon: <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"></path>
  },
  {
    id: "bluesky",
    name: "Bluesky",
    colorClass: "text-sky-700",
    icon: <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"></path>
  },
  {
    id: "googlebusiness",
    name: "GBP",
    colorClass: "text-blue-700",
    icon: <path d="M3.273 1.636c-.736 0-1.363.492-1.568 1.16L0 9.272c0 1.664 1.336 3 3 3a3 3 0 003-3c0 1.664 1.336 3 3 3a3 3 0 003-3c0 1.65 1.35 3 3 3 1.664 0 3-1.336 3-3 0 1.664 1.336 3 3 3s3-1.336 3-3l-1.705-6.476a1.646 1.646 0 00-1.568-1.16zm8.729 9.326c-.604 1.063-1.703 1.81-3.002 1.81-1.304 0-2.398-.747-3-1.806-.604 1.06-1.702 1.806-3 1.806-.484 0-.944-.1-1.363-.277v8.232c0 .9.736 1.637 1.636 1.637h17.454c.9 0 1.636-.737 1.636-1.637v-8.232a3.48 3.48 0 01-1.363.277c-1.304 0-2.398-.746-3-1.804-.602 1.058-1.696 1.804-3 1.804-1.299 0-2.394-.75-2.998-1.81zm5.725 3.765c.808 0 1.488.298 2.007.782l-.859.859a1.623 1.623 0 00-1.148-.447c-.98 0-1.772.827-1.772 1.806 0 .98.792 1.807 1.772 1.807.882 0 1.485-.501 1.615-1.191h-1.615v-1.16h2.826c.035.196.054.4.054.613 0 1.714-1.147 2.931-2.88 2.931a3 3 0 010-6z"></path>
  },
  {
    id: "telegram",
    name: "Telegram",
    colorClass: "text-sky-700",
    icon: <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"></path>
  },
  {
    id: "snapchat",
    name: "Snapchat",
    colorClass: "text-yellow-700",
    icon: <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.12-.063-.18-.015-.045-.015-.104-.015-.165.015-.239.21-.465.465-.509 3.257-.539 4.731-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-.732-.27-1.226-.63-1.2-1.093.03-.464.491-.838.991-.838.105 0 .359.015.509.09.45.18.811.271 1.08.286.21 0 .324-.045.375-.104-.015-.18-.03-.359-.045-.539-.105-1.809-.27-4.079.254-5.272C7.717 1.069 11.066.793 12.041.793h.166z"></path>
  },
];

// Character limits for each platform
const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
  pinterest: 500,
  reddit: 40000,
  bluesky: 300,
  threads: 500,
  googlebusiness: 1500,
};

// Small platform icon for badges (scaled down)
const PlatformIconSmall = ({ platform }: { platform: string }) => {
  const iconPath = PLATFORMS.find((p) => p.id === platform)?.icon;
  if (!iconPath) return null;
  
  return (
    <div className="scale-[0.5]">
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        {iconPath}
      </svg>
    </div>
  );
};

// Get platform badge style
const getPlatformBadgeStyle = (platform: string) => {
  switch (platform) {
    case "instagram":
      return "bg-gradient-to-br from-purple-600 to-pink-500";
    case "tiktok":
      return "bg-black";
    case "facebook":
      return "bg-[#1877F2]";
    case "youtube":
      return "bg-[#FF0000]";
    case "linkedin":
      return "bg-[#0A66C2]";
    case "twitter":
      return "bg-black";
    case "threads":
      return "bg-black";
    case "pinterest":
      return "bg-[#E60023]";
    case "reddit":
      return "bg-[#FF4500]";
    case "bluesky":
      return "bg-[#1185FE]";
    case "googlebusiness":
      return "bg-gradient-to-br from-blue-500 to-green-500";
    case "telegram":
      return "bg-[#0088CC]";
    case "snapchat":
      return "bg-yellow-400";
    default:
      return "bg-gray-900";
  }
};

// Platform icons for the empty state grid
const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "instagram":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
        </svg>
      );
    case "tiktok":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path>
        </svg>
      );
    case "facebook":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
        </svg>
      );
    case "youtube":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
        </svg>
      );
    case "linkedin":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
        </svg>
      );
    case "twitter":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
      );
    case "threads":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"></path>
        </svg>
      );
    case "pinterest":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"></path>
        </svg>
      );
    case "reddit":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"></path>
        </svg>
      );
    case "bluesky":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 600 530" fill="currentColor">
          <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"></path>
        </svg>
      );
    case "googlebusiness":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.273 1.636c-.736 0-1.363.492-1.568 1.16L0 9.272c0 1.664 1.336 3 3 3a3 3 0 003-3c0 1.664 1.336 3 3 3a3 3 0 003-3c0 1.65 1.35 3 3 3 1.664 0 3-1.336 3-3 0 1.664 1.336 3 3 3s3-1.336 3-3l-1.705-6.476a1.646 1.646 0 00-1.568-1.16zm8.729 9.326c-.604 1.063-1.703 1.81-3.002 1.81-1.304 0-2.398-.747-3-1.806-.604 1.06-1.702 1.806-3 1.806-.484 0-.944-.1-1.363-.277v8.232c0 .9.736 1.637 1.636 1.637h17.454c.9 0 1.636-.737 1.636-1.637v-8.232a3.48 3.48 0 01-1.363.277c-1.304 0-2.398-.746-3-1.804-.602 1.058-1.696 1.804-3 1.804-1.299 0-2.394-.75-2.998-1.81zm5.725 3.765c.808 0 1.488.298 2.007.782l-.859.859a1.623 1.623 0 00-1.148-.447c-.98 0-1.772.827-1.772 1.806 0 .98.792 1.807 1.772 1.807.882 0 1.485-.501 1.615-1.191h-1.615v-1.16h2.826c.035.196.054.4.054.613 0 1.714-1.147 2.931-2.88 2.931a3 3 0 010-6z"></path>
        </svg>
      );
    case "telegram":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"></path>
        </svg>
      );
    case "snapchat":
      return (
        <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.12-.063-.18-.015-.045-.015-.104-.015-.165.015-.239.21-.465.465-.509 3.257-.539 4.731-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-.732-.27-1.226-.63-1.2-1.093.03-.464.491-.838.991-.838.105 0 .359.015.509.09.45.18.811.271 1.08.286.21 0 .324-.045.375-.104-.015-.18-.03-.359-.045-.539-.105-1.809-.27-4.079.254-5.272C7.717 1.069 11.066.793 12.041.793h.166z"></path>
        </svg>
      );
    default:
      return null;
  }
};

// Platform hover colors
const getPlatformHoverClass = (platform: string) => {
  switch (platform) {
    case "instagram":
      return "hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-500";
    case "tiktok":
      return "hover:bg-black";
    case "facebook":
      return "hover:bg-[#1877F2]";
    case "youtube":
      return "hover:bg-[#FF0000]";
    case "linkedin":
      return "hover:bg-[#0A66C2]";
    case "twitter":
      return "hover:bg-black";
    case "threads":
      return "hover:bg-black";
    case "pinterest":
      return "hover:bg-[#E60023]";
    case "reddit":
      return "hover:bg-[#FF4500]";
    case "bluesky":
      return "hover:bg-[#1185FE]";
    case "googlebusiness":
      return "hover:bg-gradient-to-r hover:from-blue-500 hover:to-green-500";
    case "telegram":
      return "hover:bg-[#0088CC]";
    default:
      return "hover:bg-gray-600";
  }
};

interface Post {
  _id: string;
  content: string | null;
  status: string;
  contentType: string | null;
  scheduledFor: string | null;
  createdAt: string;
  socialAccount: Account;
  mediaItems?: unknown;
  platforms?: unknown;
  timezone?: string | null;
}

// Helper function to get GMT offset string for a timezone
const getTimezoneOffset = (timezone: string): string => {
  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const offsetMs = tzDate.getTime() - utcDate.getTime();
    const offsetHours = offsetMs / (1000 * 60 * 60);
    
    if (offsetHours === 0) return "GMT";
    const sign = offsetHours > 0 ? "+" : "";
    const hours = Math.floor(Math.abs(offsetHours));
    const minutes = Math.floor((Math.abs(offsetHours) - hours) * 60);
    
    if (minutes === 0) {
      return `GMT${sign}${hours}`;
    }
    return `GMT${sign}${hours}:${minutes.toString().padStart(2, "0")}`;
  } catch {
    return "GMT";
  }
};

// Timezone data organized by region
const TIMEZONE_REGIONS: Record<string, string[]> = {
  Africa: [
    "Africa/Abidjan", "Africa/Accra", "Africa/Addis Ababa", "Africa/Algiers", "Africa/Asmera",
    "Africa/Bamako", "Africa/Bangui", "Africa/Banjul", "Africa/Bissau", "Africa/Blantyre",
    "Africa/Brazzaville", "Africa/Bujumbura", "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta",
    "Africa/Conakry", "Africa/Dakar", "Africa/Dar es Salaam", "Africa/Djibouti", "Africa/Douala",
    "Africa/El Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare", "Africa/Johannesburg",
    "Africa/Juba", "Africa/Kampala", "Africa/Khartoum", "Africa/Kigali", "Africa/Kinshasa",
    "Africa/Lagos", "Africa/Libreville", "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi",
    "Africa/Lusaka", "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane",
    "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena", "Africa/Niamey",
    "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo", "Africa/Sao Tome", "Africa/Tripoli",
    "Africa/Tunis", "Africa/Windhoek",
  ],
  America: [
    "America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua", "America/Araguaina",
    "America/Argentina/La Rioja", "America/Argentina/Rio Gallegos", "America/Argentina/Salta",
    "America/Argentina/San Juan", "America/Argentina/San Luis", "America/Argentina/Tucuman",
    "America/Argentina/Ushuaia", "America/Aruba", "America/Asuncion", "America/Bahia",
    "America/Bahia Banderas", "America/Barbados", "America/Belem", "America/Belize",
    "America/Blanc-Sablon", "America/Boa Vista", "America/Bogota", "America/Boise",
    "America/Buenos Aires", "America/Cambridge Bay", "America/Campo Grande", "America/Cancun",
    "America/Caracas", "America/Catamarca", "America/Cayenne", "America/Cayman", "America/Chicago",
    "America/Chihuahua", "America/Ciudad Juarez", "America/Coral Harbour", "America/Cordoba",
    "America/Costa Rica", "America/Coyhaique", "America/Creston", "America/Cuiaba", "America/Curacao",
    "America/Danmarkshavn", "America/Dawson", "America/Dawson Creek", "America/Denver",
    "America/Detroit", "America/Dominica", "America/Edmonton", "America/Eirunepe", "America/El Salvador",
    "America/Fort Nelson", "America/Fortaleza", "America/Glace Bay", "America/Godthab",
    "America/Goose Bay", "America/Grand Turk", "America/Grenada", "America/Guadeloupe",
    "America/Guatemala", "America/Guayaquil", "America/Guyana", "America/Halifax", "America/Havana",
    "America/Hermosillo", "America/Indiana/Knox", "America/Indiana/Marengo", "America/Indiana/Petersburg",
    "America/Indiana/Tell City", "America/Indiana/Vevay", "America/Indiana/Vincennes",
    "America/Indiana/Winamac", "America/Indianapolis", "America/Inuvik", "America/Iqaluit",
    "America/Jamaica", "America/Jujuy", "America/Juneau", "America/Kentucky/Monticello",
    "America/Kralendijk", "America/La Paz", "America/Lima", "America/Los Angeles", "America/Louisville",
    "America/Lower Princes", "America/Maceio", "America/Managua", "America/Manaus", "America/Marigot",
    "America/Martinique", "America/Matamoros", "America/Mazatlan", "America/Mendoza",
    "America/Menominee", "America/Merida", "America/Metlakatla", "America/Mexico City",
    "America/Miquelon", "America/Moncton", "America/Monterrey", "America/Montevideo",
    "America/Montserrat", "America/Nassau", "America/New York", "America/Nome", "America/Noronha",
    "America/North Dakota/Beulah", "America/North Dakota/Center", "America/North Dakota/New Salem",
    "America/Ojinaga", "America/Panama", "America/Paramaribo", "America/Phoenix", "America/Port of Spain",
    "America/Port-au-Prince", "America/Porto Velho", "America/Puerto Rico", "America/Punta Arenas",
    "America/Rankin Inlet", "America/Recife", "America/Regina", "America/Resolute", "America/Rio Branco",
    "America/Santarem", "America/Santiago", "America/Santo Domingo", "America/Sao Paulo",
    "America/Scoresbysund", "America/Sitka", "America/St Barthelemy", "America/St Johns",
    "America/St Kitts", "America/St Lucia", "America/St Thomas", "America/St Vincent",
    "America/Swift Current", "America/Tegucigalpa", "America/Thule", "America/Tijuana",
    "America/Toronto", "America/Tortola", "America/Vancouver", "America/Whitehorse",
    "America/Winnipeg", "America/Yakutat",
  ],
  Antarctica: [
    "Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Macquarie",
    "Antarctica/Mawson", "Antarctica/McMurdo", "Antarctica/Palmer", "Antarctica/Rothera",
    "Antarctica/Syowa", "Antarctica/Troll", "Antarctica/Vostok",
  ],
  Arctic: [
    "Arctic/Longyearbyen",
  ],
  Asia: [
    "Asia/Aden", "Asia/Almaty", "Asia/Amman", "Asia/Anadyr", "Asia/Aqtau", "Asia/Aqtobe",
    "Asia/Ashgabat", "Asia/Atyrau", "Asia/Baghdad", "Asia/Bahrain", "Asia/Baku", "Asia/Bangkok",
    "Asia/Barnaul", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei", "Asia/Calcutta", "Asia/Chita",
    "Asia/Colombo", "Asia/Damascus", "Asia/Dhaka", "Asia/Dili", "Asia/Dubai", "Asia/Dushanbe",
    "Asia/Famagusta", "Asia/Gaza", "Asia/Hebron", "Asia/Hong Kong", "Asia/Hovd", "Asia/Irkutsk",
    "Asia/Jakarta", "Asia/Jayapura", "Asia/Jerusalem", "Asia/Kabul", "Asia/Kamchatka",
    "Asia/Karachi", "Asia/Katmandu", "Asia/Khandyga", "Asia/Krasnoyarsk", "Asia/Kuala Lumpur",
    "Asia/Kuching", "Asia/Kuwait", "Asia/Macau", "Asia/Magadan", "Asia/Makassar", "Asia/Manila",
    "Asia/Muscat", "Asia/Nicosia", "Asia/Novokuznetsk", "Asia/Novosibirsk", "Asia/Omsk", "Asia/Oral",
    "Asia/Phnom Penh", "Asia/Pontianak", "Asia/Pyongyang", "Asia/Qatar", "Asia/Qostanay",
    "Asia/Qyzylorda", "Asia/Rangoon", "Asia/Riyadh", "Asia/Saigon", "Asia/Sakhalin",
    "Asia/Samarkand", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Srednekolymsk",
    "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran", "Asia/Thimphu", "Asia/Tokyo",
    "Asia/Tomsk", "Asia/Ulaanbaatar", "Asia/Urumqi", "Asia/Ust-Nera", "Asia/Vientiane",
    "Asia/Vladivostok", "Asia/Yakutsk", "Asia/Yekaterinburg", "Asia/Yerevan",
  ],
  Atlantic: [
    "Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Canary", "Atlantic/Cape Verde",
    "Atlantic/Faeroe", "Atlantic/Madeira", "Atlantic/Reykjavik", "Atlantic/South Georgia",
    "Atlantic/St Helena", "Atlantic/Stanley",
  ],
  Australia: [
    "Australia/Adelaide", "Australia/Brisbane", "Australia/Broken Hill", "Australia/Darwin",
    "Australia/Eucla", "Australia/Hobart", "Australia/Lindeman", "Australia/Lord Howe",
    "Australia/Melbourne", "Australia/Perth", "Australia/Sydney",
  ],
  Europe: [
    "Europe/Amsterdam", "Europe/Andorra", "Europe/Astrakhan", "Europe/Athens", "Europe/Belgrade",
    "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels", "Europe/Bucharest", "Europe/Budapest",
    "Europe/Busingen", "Europe/Chisinau", "Europe/Copenhagen", "Europe/Dublin", "Europe/Gibraltar",
    "Europe/Guernsey", "Europe/Helsinki", "Europe/Isle of Man", "Europe/Istanbul", "Europe/Jersey",
    "Europe/Kaliningrad", "Europe/Kiev", "Europe/Kirov", "Europe/Lisbon", "Europe/Ljubljana",
    "Europe/London", "Europe/Luxembourg", "Europe/Madrid", "Europe/Malta", "Europe/Mariehamn",
    "Europe/Minsk", "Europe/Monaco", "Europe/Moscow", "Europe/Oslo", "Europe/Paris",
    "Europe/Podgorica", "Europe/Prague", "Europe/Riga", "Europe/Rome", "Europe/Samara",
    "Europe/San Marino", "Europe/Sarajevo", "Europe/Saratov", "Europe/Simferopol", "Europe/Skopje",
    "Europe/Sofia", "Europe/Stockholm", "Europe/Tallinn", "Europe/Tirane", "Europe/Ulyanovsk",
    "Europe/Vaduz", "Europe/Vatican", "Europe/Vienna", "Europe/Vilnius", "Europe/Volgograd",
    "Europe/Warsaw", "Europe/Zagreb", "Europe/Zurich",
  ],
  Indian: [
    "Indian/Antananarivo", "Indian/Chagos", "Indian/Christmas", "Indian/Cocos", "Indian/Comoro",
    "Indian/Kerguelen", "Indian/Mahe", "Indian/Maldives", "Indian/Mauritius", "Indian/Mayotte",
    "Indian/Reunion",
  ],
  Pacific: [
    "Pacific/Apia", "Pacific/Auckland", "Pacific/Bougainville", "Pacific/Chatham", "Pacific/Easter",
    "Pacific/Efate", "Pacific/Enderbury", "Pacific/Fakaofo", "Pacific/Fiji", "Pacific/Funafuti",
    "Pacific/Galapagos", "Pacific/Gambier", "Pacific/Guadalcanal", "Pacific/Guam", "Pacific/Honolulu",
    "Pacific/Kiritimati", "Pacific/Kosrae", "Pacific/Kwajalein", "Pacific/Majuro", "Pacific/Marquesas",
    "Pacific/Midway", "Pacific/Nauru", "Pacific/Niue", "Pacific/Norfolk", "Pacific/Noumea",
    "Pacific/Pago Pago", "Pacific/Palau", "Pacific/Pitcairn", "Pacific/Ponape", "Pacific/Port Moresby",
    "Pacific/Rarotonga", "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Tarawa", "Pacific/Tongatapu",
    "Pacific/Truk", "Pacific/Wake", "Pacific/Wallis",
  ],
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [newPostAccountId, setNewPostAccountId] = useState("");
  const [newPostPublishNow, setNewPostPublishNow] = useState(false);
  const [newPostScheduledAt, setNewPostScheduledAt] = useState("");
  const [newPostTimezone, setNewPostTimezone] = useState("America/Sao_Paulo");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loadingPostDetails, setLoadingPostDetails] = useState(false);
  const [showProfilesDropdown, setShowProfilesDropdown] = useState(false);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [modalProfileSearch, setModalProfileSearch] = useState("");
  const [selectedProfileIdForPost, setSelectedProfileIdForPost] = useState<string[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [newAccountUsername, setNewAccountUsername] = useState("");
  const [newAccountDisplayName, setNewAccountDisplayName] = useState("");
  const [newAccountProfilePicture, setNewAccountProfilePicture] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("scheduled_desc");
  const [profileSearch, setProfileSearch] = useState("");

  // Dropdown visibility states
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filter options
  const STATUS_OPTIONS = [
    { id: "all", label: "All posts", icon: null },
    { id: "draft", label: "Draft", icon: "📝" },
    { id: "scheduled", label: "Scheduled", icon: "📅" },
    { id: "queued", label: "Queued", icon: "📋" },
    { id: "published", label: "Published", icon: "✅" },
    { id: "failed", label: "Failed", icon: "❌" },
    { id: "partial", label: "Partial", icon: "⚠️" },
  ];

  const DATE_OPTIONS = [
    { id: "all", label: "All dates" },
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
    { id: "this_week", label: "This week" },
    { id: "next_week", label: "Next week" },
    { id: "this_month", label: "This month" },
    { id: "custom", label: "Custom range" },
  ];

  const SORT_OPTIONS = [
    { id: "scheduled_desc", label: "Scheduled (newest first)" },
    { id: "scheduled_asc", label: "Scheduled (oldest first)" },
    { id: "created_desc", label: "Created (newest first)" },
    { id: "created_asc", label: "Created (oldest first)" },
    { id: "status", label: "Status" },
    { id: "platform", label: "Platform" },
  ];

  // Get sort label for display
  const getSortLabel = () => {
    const option = SORT_OPTIONS.find(o => o.id === sortBy);
    if (sortBy === "scheduled_desc") return "Scheduled ↓";
    if (sortBy === "scheduled_asc") return "Scheduled ↑";
    if (sortBy === "created_desc") return "Created ↓";
    if (sortBy === "created_asc") return "Created ↑";
    return option?.label || "Sort";
  };

  // Ensure only one dropdown is open at a time
  const toggleDropdown = (type: "status" | "platform" | "profile" | "date" | "sort") => {
    const isStatus = type === "status";
    const isPlatform = type === "platform";
    const isProfile = type === "profile";
    const isDate = type === "date";
    const isSort = type === "sort";

    // If the clicked dropdown is already open, close all
    if (
      (isStatus && showStatusDropdown) ||
      (isPlatform && showPlatformDropdown) ||
      (isProfile && showProfileDropdown) ||
      (isDate && showDateDropdown) ||
      (isSort && showSortDropdown)
    ) {
      setShowStatusDropdown(false);
      setShowPlatformDropdown(false);
      setShowProfileDropdown(false);
      setShowDateDropdown(false);
      setShowSortDropdown(false);
      return;
    }

    // Open only the selected dropdown
    setShowStatusDropdown(isStatus);
    setShowPlatformDropdown(isPlatform);
    setShowProfileDropdown(isProfile);
    setShowDateDropdown(isDate);
    setShowSortDropdown(isSort);
  };

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(post => post.status === statusFilter);
    }

    // Filter by platform
    if (platformFilter !== "all") {
      result = result.filter(post => post.socialAccount.platform === platformFilter);
    }

    // Filter by profile
    if (profileFilter !== "all") {
      result = result.filter(post => post.socialAccount.profile._id === profileFilter);
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
      const startOfNextWeek = new Date(endOfWeek);
      startOfNextWeek.setDate(startOfNextWeek.getDate() + 1);
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(endOfNextWeek.getDate() + 6);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      result = result.filter(post => {
        if (!post.scheduledFor) return false;
        const postDate = new Date(post.scheduledFor);

        switch (dateFilter) {
          case "today":
            return postDate >= today && postDate < tomorrow;
          case "tomorrow":
            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            return postDate >= tomorrow && postDate < dayAfterTomorrow;
          case "this_week":
            return postDate >= today && postDate <= endOfWeek;
          case "next_week":
            return postDate >= startOfNextWeek && postDate <= endOfNextWeek;
          case "this_month":
            return postDate >= today && postDate <= endOfMonth;
          default:
            return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "scheduled_desc":
          return new Date(b.scheduledFor || b.createdAt).getTime() - new Date(a.scheduledFor || a.createdAt).getTime();
        case "scheduled_asc":
          return new Date(a.scheduledFor || a.createdAt).getTime() - new Date(b.scheduledFor || b.createdAt).getTime();
        case "created_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "created_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        case "platform":
          return (a.socialAccount.platform || "").localeCompare(b.socialAccount.platform || "");
        default:
          return 0;
      }
    });

    return result;
  }, [posts, statusFilter, platformFilter, profileFilter, dateFilter, sortBy]);

  // Filtered profiles for search
  const filteredProfiles = useMemo(() => {
    if (!profileSearch) return profiles;
    return profiles.filter(p =>
      p.name.toLowerCase().includes(profileSearch.toLowerCase())
    );
  }, [profiles, profileSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setShowStatusDropdown(false);
        setShowPlatformDropdown(false);
        setShowProfileDropdown(false);
        setShowDateDropdown(false);
        setShowSortDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultProfile = useMemo(() => {
    if (!profiles.length) return null;
    const sorted = [...profiles].sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tA - tB;
    });
    return sorted[0] ?? null;
  }, [profiles]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Atualizar previews quando arquivos mudarem
    const previews: string[] = [];
    mediaFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      previews.push(url);
    });
    setMediaPreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mediaFiles]);

  useEffect(() => {
    // Auto-resize textarea quando conteúdo mudar
    if (contentTextareaRef.current) {
      contentTextareaRef.current.style.height = "auto";
      contentTextareaRef.current.style.height = `${contentTextareaRef.current.scrollHeight}px`;
    }
  }, [newPostContent]);

  async function loadData() {
    try {
      const [postsRes, accountsRes, profilesRes] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/accounts"),
        fetch("/api/profiles"),
      ]);

      const postsData = await postsRes.json();
      const accountsData = await accountsRes.json();
      const profilesData = await profilesRes.json();

      setPosts(postsData.posts || []);
      setAccounts(accountsData.accounts || []);
      setProfiles(profilesData.profiles || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenConnectModal(platformId: string) {
    if (!defaultProfile) {
      alert("Crie um perfil em Connections antes de conectar uma conta.");
      return;
    }
    setSelectedPlatform(platformId);
    setShowConnectModal(true);
  }

  async function handleCreateAccountFromModal() {
    if (!defaultProfile || !selectedPlatform) return;

    setCreatingAccount(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: defaultProfile._id,
          platform: selectedPlatform,
          username: newAccountUsername || undefined,
          displayName: newAccountDisplayName || undefined,
          profilePicture: newAccountProfilePicture || undefined,
        }),
      });

      if (res.ok) {
        await loadData();
        setShowConnectModal(false);
        setNewAccountUsername("");
        setNewAccountDisplayName("");
        setNewAccountProfilePicture("");
        setSelectedPlatform("");
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao criar conta");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Erro ao criar conta");
    } finally {
      setCreatingAccount(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setMediaFiles(files);
    
    // Check if there's a PDF and if the selected account doesn't support PDF
    const hasPdf = files.some(
      (file) =>
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    );
    
    if (hasPdf && newPostAccountId) {
      const selectedAccount = accounts.find((a) => a._id === newPostAccountId);
      if (selectedAccount) {
        const pdfSupportedPlatforms = ["linkedin", "facebook"];
        if (!pdfSupportedPlatforms.includes(selectedAccount.platform.toLowerCase())) {
          setNewPostAccountId("");
        }
      }
    }
  }

  function removeMediaFile(index: number) {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  }

  function resetCreatePostForm() {
    setNewPostContent("");
    setNewPostAccountId("");
    setNewPostPublishNow(false);
    setNewPostScheduledAt("");
    setNewPostTimezone("America/Sao_Paulo");
    setMediaFiles([]);
    setShowTimezoneDropdown(false);
    setTimezoneSearch("");
    setSelectedProfileIdForPost([]);
    setModalProfileSearch("");
    setShowProfilesDropdown(false);
  }

  function getInferredFormat(): string {
    if (mediaFiles.length === 0) return "";
    try {
      const mediaItems: MediaItem[] = mediaFiles.map((file) => ({
        type: file.type.startsWith("video/") ? "video" : "image",
        url: `mock://${file.name}`, // Mock URL apenas para inferência
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      }));
      const contentType = inferContentType(mediaItems);
      if (contentType === "post") return "Post";
      if (contentType === "reel") return "Reel";
      if (contentType === "carousel") return "Carousel";
      return "";
    } catch {
      return "Erro ao inferir formato";
    }
  }

  async function handleCreate() {
    if (mediaFiles.length === 0) {
      alert("Selecione pelo menos um arquivo de mídia");
      return;
    }

    if (selectedProfileIdForPost.length === 0) {
      alert("Selecione pelo menos um perfil");
      return;
    }

    if (!newPostPublishNow && !newPostScheduledAt) {
      alert("Selecione uma data para agendamento");
      return;
    }

    // Validar limite de caracteres baseado nas plataformas dos perfis selecionados
    if (selectedProfileIdForPost.length > 0 && newPostContent) {
      const profileAccounts = accounts.filter((a) =>
        selectedProfileIdForPost.includes(a.profile._id || "")
      );
      
      if (profileAccounts.length > 0) {
        // Encontrar a plataforma mais restritiva entre todas as contas dos perfis selecionados
        const contentLength = newPostContent.length;
        const platformLimits = profileAccounts
          .map((account) => {
            const platformId = account.platform.toLowerCase();
            const limit = PLATFORM_CHAR_LIMITS[platformId];
            return {
              platform: account.platform,
              platformName: PLATFORMS.find((p) => p.id === platformId)?.name || account.platform,
              limit: limit || Infinity,
            };
          })
          .filter((p) => p.limit !== Infinity)
          .sort((a, b) => a.limit - b.limit);

        if (platformLimits.length > 0) {
          const mostRestrictive = platformLimits[0];
          
          if (contentLength > mostRestrictive.limit) {
            const overLimit = contentLength - mostRestrictive.limit;
            const message = `O conteúdo excede o limite de caracteres da plataforma mais restritiva.\n\n` +
              `Plataforma: ${mostRestrictive.platformName}\n` +
              `Limite: ${mostRestrictive.limit} caracteres\n` +
              `Seu conteúdo: ${contentLength} caracteres\n` +
              `Excesso: ${overLimit} caracteres\n\n` +
              `Por favor, reduza o conteúdo para continuar.`;
            
            alert(message);
            return;
          }
        }
      }
    }

    setCreating(true);
    try {
      // Gerar postId temporário para organizar os uploads
      const tempPostId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Fazer upload de todos os arquivos
      const uploadPromises = mediaFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("postId", tempPostId);

        const uploadRes = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const error = await uploadRes.json();
          throw new Error(error.error || "Erro ao fazer upload do arquivo");
        }

        return await uploadRes.json();
      });

      const uploadResults = await Promise.all(uploadPromises);

      // Converter resultados de upload para mediaItems
      const mediaItems: MediaItem[] = uploadResults.map((result) => ({
        type: result.type,
        url: result.url,
        filename: result.filename,
        size: result.size,
        mimeType: result.mimeType,
      }));

      // Criar posts com URLs reais
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPostContent || undefined,
          mediaItems,
          profileIds: selectedProfileIdForPost,
          publishNow: newPostPublishNow,
          scheduledAt: newPostPublishNow ? undefined : newPostScheduledAt,
          timezone: newPostPublishNow ? undefined : newPostTimezone,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        
        // Tratar resposta que pode ser sucesso total, parcial ou erro
        if (result.success === false && result.posts?.length === 0) {
          // Nenhum post foi criado
          let errorMessage = result.error || "Erro ao criar posts";
          if (result.details) {
            errorMessage += `\n\n${result.details}`;
          }
          if (result.errors && result.errors.length > 0) {
            errorMessage += "\n\nErros:\n" + result.errors.map((e: any) => 
              `- ${e.platform}: ${e.error}${e.details ? ` (${JSON.stringify(e.details)})` : ""}`
            ).join("\n");
          }
          if (result.skipped && result.skipped.length > 0) {
            errorMessage += "\n\nContas puladas:\n" + result.skipped.map((s: any) => 
              `- ${s.platform}: ${s.reason}`
            ).join("\n");
          }
          alert(errorMessage);
        } else if (result.posts && result.posts.length > 0) {
          // Posts foram criados (total ou parcial)
          const successCount = result.posts.length;
          const totalAttempted = successCount + (result.errors?.length || 0) + (result.skipped?.length || 0);
          
          if (result.errors && result.errors.length > 0) {
            // Sucesso parcial
            let message = `${successCount} de ${totalAttempted} posts criados com sucesso.\n\n`;
            if (result.errors.length > 0) {
              message += "Erros:\n" + result.errors.map((e: any) => 
                `- ${e.platform}: ${e.error}`
              ).join("\n") + "\n\n";
            }
            if (result.skipped && result.skipped.length > 0) {
              message += "Contas puladas:\n" + result.skipped.map((s: any) => 
                `- ${s.platform}: ${s.reason}`
              ).join("\n");
            }
            alert(message);
          } else {
            // Sucesso total
            if (result.skipped && result.skipped.length > 0) {
              alert(`${successCount} posts criados com sucesso.\n\n${result.skipped.length} conta(s) foram puladas (não suportam o tipo de mídia).`);
            }
          }

          await loadData();
          resetCreatePostForm();
          setShowCreateModal(false);
        } else {
          // Resposta inesperada
          alert("Posts criados, mas formato de resposta inesperado.");
          await loadData();
          resetCreatePostForm();
          setShowCreateModal(false);
        }
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao criar posts");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao criar post"
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm("Tem certeza que deseja deletar este post?")) return;

    setDeleting(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p._id !== postId));
        if (selectedPost?._id === postId) {
          setSelectedPost(null);
        }
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao deletar post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Erro ao deletar post");
    } finally {
      setDeleting(null);
    }
  }

  async function handleViewPost(post: Post) {
    setLoadingPostDetails(true);
    setSelectedPost(post);

    // Buscar detalhes completos do post se necessário
    try {
      const apiKeys = await fetch("/api/api-keys").then((r) => r.json());
      if (apiKeys.apiKeys?.length > 0) {
        const apiKey = apiKeys.apiKeys[0].key;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/posts/${post._id}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setSelectedPost({ ...post, ...data.post });
        }
      }
    } catch (error) {
      console.error("Error loading post details:", error);
    } finally {
      setLoadingPostDetails(false);
    }
  }

  const inferredFormat = getInferredFormat();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Calendar state
  const [calendarCurrentMonth, setCalendarCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [calendarWeekStart, setCalendarWeekStart] = useState<"sun" | "mon">("sun");

  const calendarMonthLabel = useMemo(() => {
    return calendarCurrentMonth.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [calendarCurrentMonth]);

  const postsByDate = useMemo(() => {
    const map = new Map<string, Post[]>();

    const makeKey = (d: Date) => {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const mm = month < 10 ? `0${month}` : `${month}`;
      const dd = day < 10 ? `0${day}` : `${day}`;
      return `${year}-${mm}-${dd}`;
    };

    filteredPosts.forEach((post) => {
      if (!post.scheduledFor) return;
      const d = new Date(post.scheduledFor);
      if (Number.isNaN(d.getTime())) return;
      const key = makeKey(d);
      const list = map.get(key);
      if (list) {
        list.push(post);
      } else {
        map.set(key, [post]);
      }
    });

    return map;
  }, [filteredPosts]);

  const calendarDays = useMemo(() => {
    const year = calendarCurrentMonth.getFullYear();
    const month = calendarCurrentMonth.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

    const firstDayOfWeek = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    let offset = firstDayOfWeek;
    if (calendarWeekStart === "mon") {
      // convert to Monday-based index
      offset = (firstDayOfWeek - 1 + 7) % 7;
    }

    // Start on the first day of the week that contains the 1st of the month
    const startDate = new Date(year, month, 1 - offset);

    const days: {
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      posts: Post[];
    }[] = [];

    const makeKey = (d: Date) => {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const day = d.getDate();
      return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };

    // Calculate total days from startDate until the week that contains the last day of month,
    // then round up to full weeks so grid ends exactly on that week.
    const diffMs = lastOfMonth.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    const totalCells = Math.ceil(diffDays / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const key = makeKey(d);
      const postsForDay = postsByDate.get(key) ?? [];

      days.push({
        date: d,
        isCurrentMonth: d.getMonth() === month,
        isToday: key === todayKey,
        posts: postsForDay,
      });
    }

    return days;
  }, [calendarCurrentMonth, calendarWeekStart, postsByDate]);

  // Check if there are any connected accounts
  const hasConnectedAccounts = accounts.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
      <div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 font-mono">
              Posts
            </h1>
            <p className="text-gray-700 dark:text-gray-300 font-mono text-sm sm:text-base">
              manage your scheduled and published content
            </p>
          </div>
          <div className="flex flex-col items-stretch md:items-end gap-2">
            <div className="flex bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-0.5 dashboard-view-toggle self-start md:self-auto">
              <button
                onClick={() => setViewMode("list")}
                className={`px-2 py-1.5 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-2 py-1.5 rounded-md transition-all ${
                  viewMode === "calendar"
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="Calendar view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={() => {
                  // Pré-selecionar o profile padrão e primeira conta dele, se existir
                  const initialProfileId = defaultProfile?._id ?? null;
                  setSelectedProfileIdForPost(initialProfileId ? [initialProfileId] : []);
                  if (initialProfileId) {
                    const profileAccounts = accounts.filter(
                      (a) => a.profile._id === initialProfileId
                    );
                    setNewPostAccountId(profileAccounts[0]?._id || "");
                  } else {
                    setNewPostAccountId("");
                  }
                  setShowProfilesDropdown(false);
                  setModalProfileSearch("");
                  setNewPostPublishNow(false);
                  setShowCreateModal(true);
                }}
                className="text-black px-4 py-2 rounded-lg hover:opacity-90 transition-colors font-mono font-semibold whitespace-nowrap w-full sm:w-auto text-center"
                style={{ backgroundColor: "rgb(255, 237, 160)" }}
              >
                + create post
              </button>
              {/* <button className="px-4 py-2 rounded-lg transition-colors font-mono font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white whitespace-nowrap w-full sm:w-auto text-center" title="Import posts from CSV">
                import CSV
              </button> */}
            </div>
          </div>
        </div>

        {/* Filters row */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => toggleDropdown("status")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${statusFilter !== "all"
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                <span>{STATUS_OPTIONS.find(o => o.id === statusFilter)?.label || "Status"}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-full">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setStatusFilter(option.id);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-mono text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${statusFilter === option.id
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      {option.icon ? <span>{option.icon}</span> : null}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Platform Filter */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => toggleDropdown("platform")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${platformFilter !== "all"
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                <span>
                  {platformFilter === "all"
                    ? "All Platforms"
                    : PLATFORMS.find(p => p.id === platformFilter)?.name || "Platform"}
                </span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showPlatformDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 w-full min-w-full">
                  <button
                    onClick={() => {
                      setPlatformFilter("all");
                      setShowPlatformDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-mono text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${platformFilter === "all"
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300"
                      } w-full`}
                  >
                    <span>All Platforms</span>
                  </button>
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => {
                        setPlatformFilter(platform.id);
                        setShowPlatformDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-mono text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${platformFilter === platform.id
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      <span className={platform.colorClass}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          {platform.icon}
                        </svg>
                      </span>
                      <span>{platform.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Filter */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => toggleDropdown("profile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${profileFilter !== "all"
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                <span>
                  {profileFilter === "all"
                    ? "All profiles"
                    : profiles.find(p => p._id === profileFilter)?.name || "Profile"}
                </span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showProfileDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1 max-h-80 overflow-y-auto">
                  <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search profiles..."
                        value={profileSearch}
                        onChange={(e) => setProfileSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        autoFocus
                      />
                    </div>
                  </div>
                  {/* <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono mb-1">
                    v Filter by Profile
                  </div> */}
                  <button
                    onClick={() => {
                      setProfileFilter("all");
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <span>All profiles</span>
                    {profileFilter === "all" && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                  </button>
                  {filteredProfiles.map((profile) => (
                    <button
                      key={profile._id}
                      onClick={() => {
                        setProfileFilter(profile._id);
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <div className="truncate pr-2">{profile.name}</div>
                      {profileFilter === profile._id && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                    </button>
                  ))}
                  {filteredProfiles.length === 0 && (
                    <div className="px-3 py-4 text-center text-xs text-gray-500">
                      No profiles found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => toggleDropdown("date")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${dateFilter !== "all"
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                <span>{DATE_OPTIONS.find(o => o.id === dateFilter)?.label || "All dates"}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showDateDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1">
                  {/* <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono border-b border-gray-100 dark:border-gray-700 mb-1">
                    v Filter by Date
                  </div> */}
                  {DATE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setDateFilter(option.id);
                        setShowDateDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <span>{option.label}</span>
                      {dateFilter === option.id && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

            {/* Sort Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => toggleDropdown("sort")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              >
                <Filter className="w-3 h-3 mr-0.5" />
                <span>{getSortLabel()}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1">
                  {/* <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono border-b border-gray-100 dark:border-gray-700 mb-1">
                    v Sort by
                  </div> */}
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setShowSortDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <span>{option.label}</span>
                      {sortBy === option.id && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content area */}
        {loading ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">Carregando...</div>
        ) : !hasConnectedAccounts ? (
          /* Empty state when no accounts are connected */
          <div
            id="connection-grid"
            className="empty-state-container bg-gray-50 dark:bg-gray-900 rounded-lg p-6 md:p-12 border border-gray-200 dark:border-gray-700 text-center transition-all duration-300"
          >
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-8 font-mono md:hidden">
                Select a platform to connect
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-6 max-w-xl mx-auto">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handleOpenConnectModal(platform.id)}
                    className={`platform-connect-btn bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 ${getPlatformHoverClass(
                      platform.id
                    )} p-2 md:p-4 rounded-lg flex items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white group`}
                    data-platform={platform.id}
                    title={`Connect ${platform.name}`}
                  >
                    <PlatformIcon platform={platform.id} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === "calendar" ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                  {calendarMonthLabel}
                </h2>
                <button
                  onClick={() => {
                    const now = new Date();
                    setCalendarCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                  }}
                  className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all font-mono"
                >
                  Today
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCalendarCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setCalendarCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-end mb-2 gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">week starts on</span>
                <div className="inline-flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setCalendarWeekStart("sun")}
                    className={`px-2 py-1 text-xs font-mono transition-colors ${
                      calendarWeekStart === "sun"
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title="Start week on Sunday"
                  >
                    Sun
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarWeekStart("mon")}
                    className={`px-2 py-1 text-xs font-mono transition-colors border-l border-gray-300 dark:border-gray-700 ${
                      calendarWeekStart === "mon"
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title="Start week on Monday"
                  >
                    Mon
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0 mb-2">
                {(calendarWeekStart === "sun"
                  ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                  : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                ).map((label) => (
                  <div key={label} className="text-center text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0">
                {calendarDays.map((day, index) => {
                  const isOut = !day.isCurrentMonth;
                  const hasPosts = day.posts.length > 0;

                  return (
                    <div
                      key={day.date.toISOString() + index}
                      className={[
                        "min-h-[100px] border p-2 cursor-pointer transition-colors calendar-day border-gray-200 dark:border-gray-700",
                        day.isToday ? "border-yellow-400/30 dark:border-yellow-300/10 ring-1 ring-yellow-400 dark:ring-yellow-300 ring-inset calendar-day--today" : "",
                        isOut ? "bg-gray-100/50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600 calendar-day--out" : "bg-white dark:bg-gray-900",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={[
                            "text-sm font-mono",
                            day.isToday ? "text-yellow-600 dark:text-yellow-300 font-bold" : "text-gray-900 dark:text-white",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {day.date.getDate()}
                        </span>
                        {hasPosts && (
                          <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 text-[10px] px-1.5 py-0.5 font-mono">
                            {day.posts.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {day.posts.slice(0, 3).map((post) => (
                          <button
                            key={post._id}
                            type="button"
                            onClick={() => handleViewPost(post)}
                            className="w-full text-left text-[11px] leading-tight px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors truncate"
                            title={post.content || undefined}
                          >
                            <span className="mr-1 text-[9px] uppercase tracking-wide">
                              {post.socialAccount.platform}
                            </span>
                            <span className="opacity-80">
                              {post.content ? post.content : `Post (${post.status})`}
                            </span>
                          </button>
                        ))}
                        {day.posts.length > 3 && (
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                            +{day.posts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          posts.length === 0 ? (
            <div
              id="connection-grid"
              className="empty-state-container bg-gray-50 dark:bg-gray-900 rounded-lg p-6 md:p-12 border border-gray-200 dark:border-gray-700 text-center transition-all duration-300"
            >
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-200 dark:border-gray-700">
                    <svg
                      className="w-10 h-10 text-gray-600 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-mono">No posts yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 font-mono">Create your first social media post</p>
                </div>
                <button
                  onClick={() => {
                    const initialProfileId = defaultProfile?._id ?? null;
                    setSelectedProfileIdForPost(initialProfileId ? [initialProfileId] : []);
                    if (initialProfileId) {
                      const profileAccounts = accounts.filter(
                        (a) => a.profile._id === initialProfileId
                      );
                      setNewPostAccountId(profileAccounts[0]?._id || "");
                    } else {
                      setNewPostAccountId("");
                    }
                    setShowProfilesDropdown(false);
                    setModalProfileSearch("");
                    setShowCreateModal(true);
                  }}
                  className="w-full text-black px-6 py-3 rounded-lg hover:opacity-90 transition-colors font-mono font-semibold max-w-md mx-auto"
                  style={{ backgroundColor: "rgb(255, 237, 160)" }}
                >
                  create post
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
              No posts match current filters
            </div>
          )
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleViewPost(post)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded capitalize">
                        {post.contentType || "unknown"}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800"
                            : post.status === "scheduled"
                            ? "bg-yellow-100 text-yellow-800"
                            : post.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    {post.content && (
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{post.content}</p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {post.socialAccount.platform} - @{post.socialAccount.username || "sem username"} (
                      {post.socialAccount.profile.name})
                    </p>
                    {post.scheduledFor && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Agendado para: {new Date(post.scheduledFor).toLocaleString("pt-BR")}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2 font-mono">{post._id}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Criado em: {new Date(post.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post._id);
                    }}
                    disabled={deleting === post._id}
                    className="ml-4 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    {deleting === post._id ? "Deletando..." : "Deletar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Detalhes do Post */}
        {selectedPost && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPost(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Detalhes do Post</h2>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {loadingPostDetails ? (
                  <div className="text-center py-8">Carregando detalhes...</div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${selectedPost.status === "published" ? "bg-green-100 text-green-800" :
                          selectedPost.status === "scheduled" ? "bg-yellow-100 text-yellow-800" :
                            selectedPost.status === "failed" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                          }`}>
                          {selectedPost.status}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded capitalize">
                          {selectedPost.contentType || "unknown"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Conteúdo</label>
                      <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                        {selectedPost.content || <span className="text-gray-400">Sem conteúdo</span>}
                      </p>
                    </div>

                    {selectedPost.mediaItems && Array.isArray(selectedPost.mediaItems) && selectedPost.mediaItems.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">
                          Mídia ({selectedPost.mediaItems.length} item{selectedPost.mediaItems.length > 1 ? "s" : ""})
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedPost.mediaItems.map((item: MediaItem, index: number) => {
                            const isVideo = item.type === "video";
                            const isMockUrl = item.url?.startsWith("https://example.com") || item.url?.startsWith("mock://");

                            return (
                              <div key={index} className="relative">
                                {isMockUrl ? (
                                  <div className="w-full h-48 bg-gray-200 rounded flex flex-col items-center justify-center">
                                    <div className="text-gray-400 text-4xl mb-2">
                                      {isVideo ? "🎥" : "🖼️"}
                                    </div>
                                    <div className="text-xs text-gray-500 text-center px-2">
                                      {item.filename || `Item ${index + 1}`}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {isVideo ? "Vídeo" : "Imagem"} (Mock)
                                    </div>
                                  </div>
                                ) : isVideo ? (
                                  <video
                                    src={item.url}
                                    className="w-full h-48 object-cover rounded"
                                    controls
                                    onError={(e) => {
                                      console.error("Error loading video:", item.url);
                                      const target = e.target as HTMLVideoElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.filename || `Media ${index + 1}`}
                                    className="w-full h-48 object-cover rounded"
                                    onError={(e) => {
                                      console.error("Error loading image:", item.url);
                                      const target = e.target as HTMLImageElement;
                                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImagem não encontrada%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                )}
                                {!isMockUrl && (
                                  <div className="mt-1 text-xs text-gray-500 truncate">
                                    {item.filename || `Item ${index + 1}`}
                                  </div>
                                )}
                                {item.size && (
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    {(item.size / 1024 / 1024).toFixed(2)} MB
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Conta Social</label>
                        <p className="mt-1 text-gray-900">
                          {selectedPost.socialAccount.platform} - @{selectedPost.socialAccount.username || "sem username"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Profile: {selectedPost.socialAccount.profile.name}
                        </p>
                      </div>

                      {selectedPost.scheduledFor && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Agendamento</label>
                          <p className="mt-1 text-gray-900">
                            {new Date(selectedPost.scheduledFor).toLocaleString("pt-BR")}
                          </p>
                          {selectedPost.timezone && (
                            <p className="text-xs text-gray-500 mt-1">
                              Timezone: {selectedPost.timezone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">ID do Post</label>
                        <p className="mt-1 text-xs font-mono text-gray-600 break-all">
                          {selectedPost._id}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Criado em</label>
                        <p className="mt-1 text-gray-900">
                          {new Date(selectedPost.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {selectedPost.platforms && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Platforms</label>
                        <pre className="mt-1 text-xs bg-gray-50 p-3 rounded overflow-auto">
                          {JSON.stringify(selectedPost.platforms, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 overflow-x-hidden create-post-modal-overlay">
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:border rounded-t-2xl md:rounded-lg w-full max-w-full md:max-w-3xl mx-2 md:mx-0 h-[95vh] max-h-[95vh] md:h-auto md:max-h-[90vh] overflow-hidden shadow-2xl transition-colors create-post-modal dashboard-panel flex flex-col">
            <div className="flex justify-between items-center px-4 py-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-mono">Create Post</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-mono">create &amp; publish content</p>
              </div>
              <div className="flex items-center gap-2">
                {/* <button
                  type="button"
                  className="px-3 h-8 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-mono"
                  title="Reuse a previous post"
                >
                  Reuse
                </button> */}
                <button
                  type="button"
                  onClick={() => {
                    resetCreatePostForm();
                    setShowCreateModal(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto overflow-x-hidden flex-1">
              <form
                id="create-post-form"
                className="px-4 py-4 md:p-6 space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
              >
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 font-mono">
                    content
                  </label>
                  <div className="relative">
                    <textarea
                      ref={contentTextareaRef}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-gray-300 dark:border-gray-600 focus:outline-none transition-all resize-none overflow-hidden font-mono text-sm"
                      rows={4}
                      placeholder="what's on your mind..."
                      required
                      value={newPostContent}
                      onChange={(e) => {
                        setNewPostContent(e.target.value);
                        // Auto-resize on change
                        if (contentTextareaRef.current) {
                          contentTextareaRef.current.style.height = "auto";
                          contentTextareaRef.current.style.height = `${contentTextareaRef.current.scrollHeight}px`;
                        }
                      }}
                    />
                    <div className="absolute bottom-3 right-3 text-xs font-mono text-gray-400">
                      {newPostContent.length} chars
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 font-mono">
                    media <span className="text-gray-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="media-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      multiple
                      accept="image/*,video/*,application/pdf"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-all">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          ></path>
                        </svg>
                      </div>
                      <div>
                        {mediaFiles.length > 0 ? (
                          <>
                            <p className="text-gray-900 dark:text-white font-medium font-mono text-sm">
                              {mediaFiles.length} new file(s) selected
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                              click to change
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-900 dark:text-white font-medium font-mono text-sm">upload media</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-mono">
                              images/videos/PDFs up to 5GB each (LinkedIn PDFs ≤ 100MB)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {mediaFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">media preview</p>
                      <div className="flex flex-wrap gap-3">
                        {mediaFiles.map((file, index) => {
                          const previewUrl = mediaPreviews[index];
                          const name = file.name;
                          const isVideo = file.type.startsWith("video/");
                          const isPdf =
                            file.type === "application/pdf" || name.toLowerCase().endsWith(".pdf");
                          const label = isVideo ? "video" : isPdf ? "document" : "image";

                          return (
                            <div
                              key={index}
                              className="relative group w-full max-w-[200px]"
                              draggable
                            >
                              {/* Media content */}
                              {isVideo ? (
                                <video
                                  src={previewUrl}
                                  className="w-full h-32 object-cover rounded-lg bg-gray-100 dark:bg-gray-800"
                                  controls
                                  playsInline
                                />
                              ) : isPdf ? (
                                <div className="w-full h-32 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 7h10M7 11h10M7 15h6M9 21h6a2 2 0 002-2V7.828a2 2 0 00-.586-1.414l-2.828-2.828A2 2 0 0012.172 3H9a2 2 0 00-2 2v14a2 2 0 002 2z"
                                      ></path>
                                    </svg>
                                    <span className="text-xs font-mono truncate max-w-[10rem]">
                                      {name}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={previewUrl}
                                  alt={name}
                                  className="w-full h-32 object-cover rounded-lg bg-gray-100 dark:bg-gray-800"
                                />
                              )}

                              {/* Hover overlay label */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                                <span className="text-white text-xs font-mono">{label}</span>
                              </div>

                              {/* Filename tooltip on hover (top-right) */}
                              <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <span className="text-white text-xs font-mono">{name}</span>
                              </div>

                              {/* NEW badge */}
                              <div className="absolute top-2 left-2 bg-green-600 text-white text-xs rounded px-1.5 py-0.5 font-mono pointer-events-none">
                                NEW
                              </div>

                              {/* Remove button */}
                              <button
                                type="button"
                                className="absolute top-2 right-2 rounded-full p-1.5 bg-red-600 text-white shadow-md ring-1 ring-black/10 hover:bg-red-700 hover:shadow-lg transition dark:bg-red-700 dark:hover:bg-red-600 dark:ring-white/20 z-10"
                                title="Remove this file"
                                aria-label="Remove file"
                                onClick={() => removeMediaFile(index)}
                              >
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                  <path d="M10 11v6"></path>
                                  <path d="M14 11v6"></path>
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 transition-opacity">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 font-mono">
                    profiles
                  </label>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-mono">
                      Select one or more profiles to post to their connected accounts
                    </p>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowProfilesDropdown((open) => !open)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-mono text-sm focus:border-gray-300 dark:focus:border-gray-600 focus:outline-none min-h-[48px]"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {selectedProfileIdForPost.length > 0 ? (
                              <>
                                <div className="flex items-center gap-1 min-w-0">
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: "rgb(255, 237, 160)" }}
                                  />
                                </div>
                                <span className="text-left truncate">
                                  {selectedProfileIdForPost.length === 1
                                    ? profiles.find((p) => p._id === selectedProfileIdForPost[0])?.name || "Selected profile"
                                    : `${selectedProfileIdForPost.length} profiles selected`}
                                </span>
                              </>
                            ) : (
                              <span className="text-left truncate text-gray-500 dark:text-gray-400">
                                Choose profiles for this post
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                          <span>
                            {selectedProfileIdForPost.length}/{profiles.length || 0}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {showProfilesDropdown && (
                        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search profiles..."
                                value={modalProfileSearch}
                                onChange={(e) => setModalProfileSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                              />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-mono">
                              <button
                                type="button"
                                className="hover:text-gray-900 dark:hover:text-white"
                                onClick={() => {
                                  setSelectedProfileIdForPost(profiles.map((p) => p._id));
                                }}
                              >
                                Select All ({profiles.length || 0})
                              </button>
                              <button
                                type="button"
                                className="hover:text-gray-900 dark:hover:text-white"
                                onClick={() => setSelectedProfileIdForPost([])}
                              >
                                Clear
                              </button>
                              <span>
                                {selectedProfileIdForPost.length}/{profiles.length || 0}
                              </span>
                            </div>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {profiles
                              .filter((p) =>
                                modalProfileSearch
                                  ? p.name.toLowerCase().includes(modalProfileSearch.toLowerCase())
                                  : true
                              )
                              .map((profile) => {
                                const checked = selectedProfileIdForPost.includes(profile._id);
                                return (
                                  <button
                                    key={profile._id}
                                    type="button"
                                    onClick={() => {
                                      if (checked) {
                                        setSelectedProfileIdForPost(
                                          selectedProfileIdForPost.filter((id) => id !== profile._id)
                                        );
                                      } else {
                                        setSelectedProfileIdForPost([
                                          ...selectedProfileIdForPost,
                                          profile._id,
                                        ]);
                                      }
                                    }}
                                    className={`w-full flex items-start gap-3 px-3 py-2 text-left text-sm transition-colors ${
                                      checked
                                        ? "bg-blue-500/10 text-gray-100"
                                        : "text-gray-200 hover:bg-gray-800"
                                    }`}
                                  >
                                    <div className="mt-0.5">
                                      <input
                                        type="checkbox"
                                        readOnly
                                        checked={checked}
                                        className="w-3.5 h-3.5 rounded border-gray-400 text-blue-500 focus:ring-0 bg-transparent"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-yellow-300" />
                                        <span className="font-mono text-sm truncate">
                                          {profile.name}
                                        </span>
                                        {defaultProfile?._id === profile._id && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-100 font-mono">
                                            default
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-400 font-mono truncate">
                                        {profile.description || "Your default profile"}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                          </div>
                          {selectedProfileIdForPost.length > 0 && (
                            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 font-mono">
                              Selected:{" "}
                              {selectedProfileIdForPost
                                .map((id) => profiles.find((p) => p._id === id)?.name)
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 font-mono">
                    platforms (from {selectedProfileIdForPost.length} profile
                    {selectedProfileIdForPost.length !== 1 ? "s" : ""})
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-xs text-gray-500 font-mono">groups</label>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-gray-500 font-mono">no groups yet</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    {selectedProfileIdForPost.length > 0
                      ? (() => {
                          const profileAccounts = accounts.filter((a) =>
                            selectedProfileIdForPost.includes(a.profile._id)
                          );

                          if (profileAccounts.length === 0) {
                            return (
                              <div className="mt-3 rounded-lg border border-dashed border-gray-600 bg-gray-900 px-6 py-8 text-center text-gray-400">
                                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                                  <span className="text-lg">+</span>
                                </div>
                                <div className="font-mono text-sm">no connected accounts</div>
                                <div className="mt-1 text-xs font-mono text-gray-500">
                                  select a profile and connect accounts first
                                </div>
                              </div>
                            );
                          }

                          // Check if there's a PDF in the media files
                          const hasPdf = mediaFiles.some(
                            (file) =>
                              file.type === "application/pdf" ||
                              file.name.toLowerCase().endsWith(".pdf")
                          );
                          const pdfSupportedPlatforms = ["linkedin", "facebook"];

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {profileAccounts.map((account) => {
                                const platformMeta = PLATFORMS.find(
                                  (p) => p.id === account.platform
                                );
                                const isSelected = newPostAccountId === account._id;
                                const supportsPdf = pdfSupportedPlatforms.includes(
                                  account.platform.toLowerCase()
                                );
                                const isDisabled = hasPdf && !supportsPdf;

                                return (
                                  <button
                                    key={account._id}
                                    type="button"
                                    onClick={() => {
                                      if (!isDisabled) {
                                        setNewPostAccountId(account._id);
                                      }
                                    }}
                                    disabled={isDisabled}
                                    className={`p-4 rounded-lg border transition-all duration-200 text-left relative ${
                                      isDisabled
                                        ? "border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed"
                                        : "border-gray-700 hover:border-gray-500 hover:bg-gray-800 bg-gray-900"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="relative w-10 h-10">
                                        {account.metadata?.profilePicture ? (
                                          <img
                                            src={account.metadata.profilePicture}
                                            alt={account.username || ""}
                                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = "none";
                                              const fallback = target.nextElementSibling as HTMLElement;
                                              if (fallback) {
                                                fallback.style.display = "flex";
                                              }
                                            }}
                                          />
                                        ) : null}
                                        <div
                                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-white border border-gray-200 dark:border-gray-700 ${
                                            account.metadata?.profilePicture
                                              ? "hidden"
                                              : platformMeta
                                              ? getPlatformBadgeStyle(platformMeta.id)
                                              : "bg-gray-800"
                                          }`}
                                          style={{
                                            display: account.metadata?.profilePicture ? "none" : "flex",
                                          }}
                                        >
                                          {platformMeta ? (
                                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                              {platformMeta.icon}
                                            </svg>
                                          ) : (
                                            <span className="text-sm font-mono">
                                              {(platformMeta?.name || "?")[0]}
                                            </span>
                                          )}
                                        </div>
                                        {platformMeta && (
                                          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-md flex items-center justify-center text-white shadow-lg ${getPlatformBadgeStyle(platformMeta.id)}`}>
                                            <PlatformIconSmall platform={platformMeta.id} />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium font-mono text-sm text-gray-900 dark:text-white">
                                          {platformMeta?.name || account.platform}
                                        </div>
                                        <div className="text-xs truncate font-mono text-gray-400">
                                          @{account.username || "account"}
                                        </div>
                                        {isDisabled && (
                                          <div className="text-xs text-red-400 font-mono mt-1">
                                            PDF posts only supported on LinkedIn
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()
                      : (
                        <div className="mt-3 rounded-lg border border-dashed border-gray-600 bg-gray-900 px-6 py-8 text-center text-gray-400">
                          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                            <span className="text-lg">+</span>
                          </div>
                          <div className="font-mono text-sm">no connected accounts</div>
                          <div className="mt-1 text-xs font-mono text-gray-500">
                            select a profile and connect accounts first
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 font-mono">
                    publishing
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setNewPostPublishNow(false)}
                      className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-mono text-sm transition-all border ${
                        !newPostPublishNow
                          ? "bg-blue-100 dark:bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPostPublishNow(true)}
                      className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-mono text-sm transition-all border ${
                        newPostPublishNow
                          ? "bg-blue-100 dark:bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Now
                    </button>
                    {/* <button
                      type="button"
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-lg font-mono text-sm transition-all bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      disabled
                      title="Queue is not available yet"
                    >
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Queue
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-lg font-mono text-sm transition-all bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      disabled
                      title="Draft is not available yet"
                    >
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      Draft
                    </button> */}
                  </div>
                  {/* <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                    Queue and Draft are planned options and are not active yet.
                  </p> */}
                  <div className="space-y-4">
                    {newPostPublishNow ? (
                      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </div>
                          <p className="text-green-300 font-mono text-sm">
                            Post will be published immediately to all selected platforms
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2 max-w-full overflow-hidden">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 font-mono">
                              schedule for
                            </label>
                          </div>
                          <input
                            className="w-full max-w-full box-border bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-gray-900 dark:text-white focus:border-gray-300 dark:focus:border-gray-600 focus:outline-none transition-all font-mono text-xs md:text-sm"
                            min={new Date().toISOString().slice(0, 16)}
                            required
                            type="datetime-local"
                            value={newPostScheduledAt}
                            onChange={(e) => setNewPostScheduledAt(e.target.value)}
                            style={{ maxWidth: "100%" }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 font-mono">
                            timezone
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white font-mono text-sm flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                              aria-haspopup="listbox"
                              aria-expanded={showTimezoneDropdown}
                              onClick={() => setShowTimezoneDropdown((v) => !v)}
                            >
                              <span className="truncate text-left pr-2">
                                {newPostTimezone} ({getTimezoneOffset(newPostTimezone)}) (current)
                              </span>
                              <svg
                                className={`w-4 h-4 text-gray-400 transition-transform ${
                                  showTimezoneDropdown ? "rotate-180" : ""
                                }`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            </button>

                            {showTimezoneDropdown && (
                              <div className="absolute z-50 mt-2 w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
                                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                  <input
                                    placeholder="Search: city, region, GMT offset"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:border-gray-300 dark:focus:border-gray-600 focus:outline-none font-mono text-sm"
                                    type="text"
                                    value={timezoneSearch}
                                    onChange={(e) => setTimezoneSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="max-h-64 overflow-auto">
                                  {Object.entries(TIMEZONE_REGIONS).map(([region, timezones]) => {
                                    const filteredTimezones = timezones.filter((tz) => {
                                      if (!timezoneSearch) return true;
                                      const searchLower = timezoneSearch.toLowerCase();
                                      const offset = getTimezoneOffset(tz);
                                      return (
                                        tz.toLowerCase().includes(searchLower) ||
                                        region.toLowerCase().includes(searchLower) ||
                                        offset.toLowerCase().includes(searchLower)
                                      );
                                    });

                                    if (filteredTimezones.length === 0) return null;

                                    return (
                                      <div key={region}>
                                        <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-gray-800/50 font-mono sticky top-0">
                                          {region}
                                        </div>
                                        {filteredTimezones.map((tz) => {
                                          const offset = getTimezoneOffset(tz);
                                          const isSelected = newPostTimezone === tz;
                                          return (
                                            <button
                                              key={tz}
                                              type="button"
                                              className={`w-full text-left px-3 py-2 text-sm font-mono transition-colors ${
                                                isSelected
                                                  ? "bg-blue-600/20 text-blue-200"
                                                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                              }`}
                                              onClick={() => {
                                                setNewPostTimezone(tz);
                                                setShowTimezoneDropdown(false);
                                                setTimezoneSearch("");
                                              }}
                                            >
                                              <span className="truncate block">
                                                {tz} ({offset})
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-3 px-4 py-3 md:px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              <button
                type="button"
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-mono text-sm"
                onClick={() => {
                  resetCreatePostForm();
                  setShowCreateModal(false);
                }}
              >
                cancel
              </button>
              <div className="relative group">
                <button
                  type="submit"
                  form="create-post-form"
                  disabled={creating}
                  className="px-6 py-2 rounded-lg transition-all duration-200 font-mono text-sm text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: "rgb(255, 237, 160)" }}
                >
                  <span>{newPostPublishNow ? "publish now" : "schedule post"}</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-black/10 rounded text-xs font-mono whitespace-nowrap">
                    Ctrl+↵
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Account Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-mono">
                Connect {PLATFORMS.find((p) => p.id === selectedPlatform)?.name}
              </h2>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
                  Profile
                </label>
                <input
                  type="text"
                  value={defaultProfile?.name || ""}
                  disabled
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-300 dark:border-gray-600 focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
                  Platform
                </label>
                <input
                  type="text"
                  value={PLATFORMS.find((p) => p.id === selectedPlatform)?.name || ""}
                  disabled
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-300 dark:border-gray-600 focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
                  Username
                </label>
                <input
                  type="text"
                  value={newAccountUsername}
                  onChange={(e) => setNewAccountUsername(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-300 dark:border-gray-600 focus:outline-none font-mono text-sm"
                  placeholder="Ex: username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newAccountDisplayName}
                  onChange={(e) => setNewAccountDisplayName(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-300 dark:border-gray-600 focus:outline-none font-mono text-sm"
                  placeholder="Nome de exibição"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  value={newAccountProfilePicture}
                  onChange={(e) => setNewAccountProfilePicture(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-300 dark:border-gray-600 focus:outline-none font-mono text-sm"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateAccountFromModal}
                  disabled={creatingAccount || !defaultProfile || !selectedPlatform}
                  className="text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "rgb(255, 237, 160)" }}
                >
                  {creatingAccount ? "Creating..." : "Connect"}
                </button>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="text-sm px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-mono"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

