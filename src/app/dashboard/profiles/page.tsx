"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  _id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count?: {
    socialAccounts: number;
  };
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileDescription, setNewProfileDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [connectingProfileId, setConnectingProfileId] = useState<string | null>(null);
  const [showPlatformMenu, setShowPlatformMenu] = useState<string | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  // Close platform menu when clicking outside
  useEffect(() => {
    if (showPlatformMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".platform-menu-container")) {
          setShowPlatformMenu(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPlatformMenu]);

  async function loadProfiles() {
    try {
      const res = await fetch("/api/profiles");
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newProfileName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProfileName,
          description: newProfileDescription || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfiles([data.profile, ...profiles]);
        setNewProfileName("");
        setNewProfileDescription("");
        setShowNewForm(false);
      } else {
        const error = await res.json();
        alert(error.error || "Error creating profile");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Error creating profile");
    } finally {
      setCreating(false);
    }
  }

  async function handleCopyId(profileId: string) {
    try {
      await navigator.clipboard.writeText(profileId);
      setCopiedId(profileId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = profileId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(profileId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  async function handleConnect(profileId: string, platform: string) {
    setConnectingProfileId(profileId);
    setShowPlatformMenu(null);

    try {
      const redirectUrl = `/dashboard/accounts?profileId=${encodeURIComponent(profileId)}`;
      
      // Build the OAuth URL directly using the current window location
      const origin = window.location.origin;
      const mockOAuthUrl = new URL("/mock/oauth", origin);
      mockOAuthUrl.searchParams.set("platform", platform);
      mockOAuthUrl.searchParams.set("profileId", profileId);
      mockOAuthUrl.searchParams.set("redirect_url", redirectUrl);

      // Redirect to the OAuth URL
      window.location.href = mockOAuthUrl.toString();
    } catch (error) {
      console.error("Error connecting:", error);
      alert(error instanceof Error ? error.message : "Error connecting account");
      setConnectingProfileId(null);
    }
  }

  async function handleDelete(profileId: string, socialAccountsCount: number) {
    // Check if there are connected social accounts
    if (socialAccountsCount > 0) {
      alert("Cannot delete the profile. Please delete all connected social accounts first.");
      return;
    }

    if (!confirm("Are you sure you want to delete this profile?")) {
      return;
    }

    setDeletingProfileId(profileId);
    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remover o profile da lista
        setProfiles(profiles.filter((p) => p._id !== profileId));
      } else {
        const error = await res.json();
        alert(error.error || "Error deleting profile");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Error deleting profile");
    } finally {
      setDeletingProfileId(null);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profiles</h1>
          <p className="text-gray-600">Manage your GetLate profiles</p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showNewForm ? "Cancel" : "Create New Profile"}
          </button>
        </div>

        {showNewForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">New Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., My Profile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newProfileDescription}
                  onChange={(e) => setNewProfileDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={creating || !newProfileName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : profiles.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No profiles created yet
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <Link
                key={profile._id}
                href={`/dashboard/accounts?profileId=${encodeURIComponent(profile._id)}`}
                className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="font-semibold text-lg mb-1">{profile.name}</h3>
                {profile.description && (
                  <p className="text-gray-600 mb-2">{profile.description}</p>
                )}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 font-mono">{profile._id}</p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopyId(profile._id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Copy ID"
                    >
                      {copiedId === profile._id ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-400">
                      {profile._count?.socialAccounts || 0} account(s) connected
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="relative platform-menu-container">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowPlatformMenu(
                              showPlatformMenu === profile._id ? null : profile._id
                            );
                          }}
                          disabled={connectingProfileId === profile._id}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          title="Connect Account"
                        >
                          {connectingProfileId === profile._id ? (
                            "Connecting..."
                          ) : (
                            "Connect Account"
                          )}
                        </button>
                        {showPlatformMenu === profile._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="py-1">
                              {["instagram", "facebook", "twitter", "tiktok"].map(
                                (platform) => (
                                  <button
                                    key={platform}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleConnect(profile._id, platform);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
                                  >
                                    {platform}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(profile._id, profile._count?.socialAccounts || 0);
                        }}
                        disabled={deletingProfileId === profile._id}
                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        title="Delete Profile"
                      >
                        {deletingProfileId === profile._id ? (
                          "Deleting..."
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Created at: {new Date(profile.createdAt).toLocaleString("en-US")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

