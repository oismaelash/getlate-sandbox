"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAccountId, setNewPostAccountId] = useState("");
  const [newPostPublishNow, setNewPostPublishNow] = useState(true);
  const [newPostScheduledAt, setNewPostScheduledAt] = useState("");
  const [newPostTimezone, setNewPostTimezone] = useState("America/Sao_Paulo");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loadingPostDetails, setLoadingPostDetails] = useState(false);
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
  }

  function removeMediaFile(index: number) {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
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

    if (!newPostAccountId) {
      alert("Selecione uma conta");
      return;
    }

    if (!newPostPublishNow && !newPostScheduledAt) {
      alert("Selecione uma data para agendamento");
      return;
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

      // Criar post com URLs reais
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPostContent || undefined,
          mediaItems,
          accountId: newPostAccountId,
          publishNow: newPostPublishNow,
          scheduledAt: newPostPublishNow ? undefined : newPostScheduledAt,
          timezone: newPostPublishNow ? undefined : newPostTimezone,
        }),
      });

      if (res.ok) {
        const postData = await res.json();
        const createdPostId = postData.post?._id || postData._id;

        // Se o post foi criado com sucesso, renomear diretório de temp para o ID real
        if (createdPostId && tempPostId.startsWith("temp-")) {
          // Nota: Esta operação seria feita no backend, mas por enquanto
          // os arquivos ficam no diretório temp. Podemos mover no backend se necessário.
        }

        await loadData();
        setNewPostContent("");
        setNewPostAccountId("");
        setNewPostPublishNow(true);
        setNewPostScheduledAt("");
        setMediaFiles([]);
        setShowNewForm(false);
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao criar post");
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
                className="px-2 py-1.5 rounded-md transition-all bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                title="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                className="px-2 py-1.5 rounded-md transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                title="Calendar view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={() => setShowNewForm(!showNewForm)}
                className="text-black px-4 py-2 rounded-lg hover:opacity-90 transition-colors font-mono font-semibold whitespace-nowrap w-full sm:w-auto text-center"
                style={{ backgroundColor: "rgb(255, 237, 160)" }}
              >
                + create post
              </button>
              <button className="px-4 py-2 rounded-lg transition-colors font-mono font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white whitespace-nowrap w-full sm:w-auto text-center" title="Import posts from CSV">
                import CSV
              </button>
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
          <div id="connection-grid" className="empty-state-container bg-gray-50 dark:bg-gray-900 rounded-lg p-6 md:p-12 border border-gray-200 dark:border-gray-700 text-center transition-all duration-300">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-8 font-mono md:hidden">
                Select a platform to connect
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-6 max-w-xl mx-auto">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handleOpenConnectModal(platform.id)}
                    className={`platform-connect-btn bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 ${getPlatformHoverClass(platform.id)} p-2 md:p-4 rounded-lg flex items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white group`}
                    data-platform={platform.id}
                    title={`Connect ${platform.name}`}
                  >
                    <PlatformIcon platform={platform.id} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            {posts.length === 0
              ? "Nenhum post criado ainda"
              : "No posts match current filters"}
          </div>
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
                      <span className={`text-xs px-2 py-1 rounded ${post.status === "published" ? "bg-green-100 text-green-800" :
                        post.status === "scheduled" ? "bg-yellow-100 text-yellow-800" :
                          post.status === "failed" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                        }`}>
                        {post.status}
                      </span>
                    </div>
                    {post.content && (
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{post.content}</p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {post.socialAccount.platform} - @{post.socialAccount.username || "sem username"} ({post.socialAccount.profile.name})
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

