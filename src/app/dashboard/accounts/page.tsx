"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Profile {
  _id: string;
  name: string;
}

interface Account {
  _id: string;
  platform: string;
  username: string | null;
  status: string | null;
  createdAt: string;
  profile: Profile;
  metadata?: {
    profilePicture?: string | null;
    displayName?: string | null;
    profileUrl?: string | null;
  };
}

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileIdFilter = searchParams?.get("profileId") || null;
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAccountProfileId, setNewAccountProfileId] = useState("");
  const [newAccountPlatform, setNewAccountPlatform] = useState("instagram");
  const [newAccountUsername, setNewAccountUsername] = useState("");
  const [newAccountDisplayName, setNewAccountDisplayName] = useState("");
  const [newAccountProfilePicture, setNewAccountProfilePicture] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [profileIdFilter]);

  useEffect(() => {
    // Pre-fill profileId if filter is active
    if (profileIdFilter && !newAccountProfileId) {
      setNewAccountProfileId(profileIdFilter);
    }
  }, [profileIdFilter]);

  async function loadData() {
    try {
      const [accountsRes, profilesRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/profiles"),
      ]);

      const accountsData = await accountsRes.json();
      const profilesData = await profilesRes.json();

      let allAccounts: Account[] = accountsData.accounts || [];
      
      // Filter by profileId if provided
      if (profileIdFilter) {
        allAccounts = allAccounts.filter(
          (account) => account.profile._id === profileIdFilter
        );
      }

      setAccounts(allAccounts);
      setProfiles(profilesData.profiles || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newAccountProfileId || !newAccountPlatform) return;

    setCreating(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: newAccountProfileId,
          platform: newAccountPlatform,
          username: newAccountUsername || undefined,
          displayName: newAccountDisplayName || undefined,
          profilePicture: newAccountProfilePicture || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Recarregar accounts para incluir o profile
        await loadData();
        setNewAccountProfileId("");
        setNewAccountPlatform("instagram");
        setNewAccountUsername("");
        setNewAccountDisplayName("");
        setNewAccountProfilePicture("");
        setShowNewForm(false);
      } else {
        const error = await res.json();
        alert(error.error || "Error creating account");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Error creating account");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(accountId: string) {
    if (!confirm("Are you sure you want to remove this account?")) return;

    setDeleting(accountId);
    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAccounts(accounts.filter((a) => a._id !== accountId));
      } else {
        const error = await res.json();
        alert(error.error || "Error removing account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error removing account");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold mb-2">Social Accounts</h1>
              <p className="text-gray-600">Manage your connected social accounts</p>
            </div>
            {profileIdFilter && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Filtered by profile:{" "}
                  <span className="font-mono text-xs">
                    {profiles.find((p) => p._id === profileIdFilter)?.name || profileIdFilter}
                  </span>
                </span>
                <Link
                  href="/dashboard/accounts"
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                >
                  Clear filter
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showNewForm ? "Cancel" : "Connect New Account"}
          </button>
        </div>

        {showNewForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">New Social Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Profile *</label>
                <select
                  value={newAccountProfileId}
                  onChange={(e) => setNewAccountProfileId(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select a profile</option>
                  {profiles.map((profile) => (
                    <option key={profile._id} value={profile._id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform *</label>
                <select
                  value={newAccountPlatform}
                  onChange={(e) => setNewAccountPlatform(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={newAccountUsername}
                  onChange={(e) => setNewAccountUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Ex: username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  value={newAccountDisplayName}
                  onChange={(e) => setNewAccountDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profile Picture URL</label>
                <input
                  type="url"
                  value={newAccountProfilePicture}
                  onChange={(e) => setNewAccountProfilePicture(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="https://..."
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={creating || !newAccountProfileId || !newAccountPlatform}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : accounts.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            {profileIdFilter
              ? "No accounts connected to this profile"
              : "No accounts connected yet"}
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => {
              const profilePicture = account.metadata?.profilePicture;
              return (
                <div key={account._id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 flex items-start gap-4">
                      {profilePicture ? (
                        <div className="flex-shrink-0">
                          <img
                            src={profilePicture}
                            alt={account.username || account.platform}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                          <span className="text-2xl font-semibold text-gray-400 capitalize">
                            {account.platform.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg capitalize">{account.platform}</h3>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            {account.status || "active"}
                          </span>
                        </div>
                        {account.username && (
                          <p className="text-gray-600 mb-1">@{account.username}</p>
                        )}
                        {account.metadata?.displayName && (
                          <p className="text-sm text-gray-700 mb-1 font-medium">
                            {account.metadata.displayName}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">Profile: {account.profile.name}</p>
                        <p className="text-xs text-gray-400 mt-2 font-mono">{account._id}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created at: {new Date(account.createdAt).toLocaleString("en-US")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(account._id)}
                      disabled={deleting === account._id}
                      className="ml-4 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                    >
                      {deleting === account._id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

