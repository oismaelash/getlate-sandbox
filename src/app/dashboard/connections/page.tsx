"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Edit, Copy, Check, Link as LinkIcon, X } from "lucide-react";

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
  createdAt?: string;
  metadata?: {
    displayName?: string | null;
    profilePicture?: string | null;
    profileUrl?: string | null;
  };
  profile: {
    _id: string;
    name: string;
  };
}

const PLATFORMS = [
  { id: "tiktok", name: "TikTok" },
  { id: "instagram", name: "Instagram" },
  { id: "facebook", name: "Facebook" },
  { id: "youtube", name: "YouTube" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "twitter", name: "X" },
  { id: "threads", name: "Threads" },
  { id: "bluesky", name: "Bluesky" },
  { id: "pinterest", name: "Pinterest" },
  { id: "reddit", name: "Reddit" },
  { id: "google-business", name: "Google Business" },
  { id: "telegram", name: "Telegram" },
];

export default function ConnectionsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [copiedProfileId, setCopiedProfileId] = useState(false);
  const [copiedAccountId, setCopiedAccountId] = useState<string | false>(false);
  const [newAccountUsername, setNewAccountUsername] = useState("");
  const [newAccountDisplayName, setNewAccountDisplayName] = useState("");
  const [newAccountProfilePicture, setNewAccountProfilePicture] = useState("");
  const [creating, setCreating] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileDescription, setNewProfileDescription] = useState("");
  const [newProfileColor, setNewProfileColor] = useState("#ffeda0");
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [showNewProfileForm, setShowNewProfileForm] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProfileId) {
      loadAccounts();
    }
  }, [selectedProfileId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    }

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  async function loadData() {
    try {
      const profilesRes = await fetch("/api/profiles");
      const profilesData = await profilesRes.json();
      const profilesList = profilesData.profiles || [];
      setProfiles(profilesList);

      if (profilesList.length > 0 && !selectedProfileId) {
        setSelectedProfileId(profilesList[0]._id);
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAccounts() {
    if (!selectedProfileId) return;

    try {
      const accountsRes = await fetch("/api/accounts");
      const accountsData = await accountsRes.json();
      const allAccounts = accountsData.accounts || [];
      const filteredAccounts = allAccounts.filter(
        (account: Account) => account.profile._id === selectedProfileId
      );
      setAccounts(filteredAccounts);
    } catch (error) {
      console.error("Error loading accounts:", error);
    }
  }

  function handleConnect(platformId: string) {
    if (!selectedProfileId) {
      alert("Por favor, selecione um profile primeiro");
      return;
    }
    setSelectedPlatform(platformId);
    setShowConnectModal(true);
  }

  async function handleCreateAccount() {
    if (!selectedProfileId || !selectedPlatform) return;

    setCreating(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedProfileId,
          platform: selectedPlatform,
          username: newAccountUsername || undefined,
          displayName: newAccountDisplayName || undefined,
          profilePicture: newAccountProfilePicture || undefined,
        }),
      });

      if (res.ok) {
        await loadAccounts();
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
      setCreating(false);
    }
  }

  function copyProfileId() {
    if (selectedProfileId) {
      navigator.clipboard.writeText(selectedProfileId);
      setCopiedProfileId(true);
      setTimeout(() => setCopiedProfileId(false), 2000);
    }
  }

  function copyAccountId(accountId: string) {
    navigator.clipboard.writeText(accountId);
    setCopiedAccountId(accountId);
    setTimeout(() => setCopiedAccountId(false), 2000);
  }

  async function handleDisconnect(accountId: string) {
    if (!confirm("Tem certeza que deseja desconectar esta conta?")) {
      return;
    }

    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadAccounts();
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao desconectar conta");
      }
    } catch (error) {
      console.error("Error disconnecting account:", error);
      alert("Erro ao desconectar conta");
    }
  }

  function handleEditProfile(profileId: string) {
    const profile = profiles.find((p) => p._id === profileId);
    if (profile) {
      setEditingProfileId(profileId);
      setNewProfileName(profile.name);
      setNewProfileDescription(profile.description || "");
      setNewProfileColor("#ffeda0");
      setShowNewProfileForm(true);
    }
  }

  async function handleDeleteProfile(profileId: string) {
    if (!confirm("Tem certeza que deseja deletar este perfil? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remover o perfil da lista
        const updatedProfiles = profiles.filter((p) => p._id !== profileId);
        setProfiles(updatedProfiles);

        // Se o perfil deletado era o selecionado, selecionar outro
        if (selectedProfileId === profileId) {
          if (updatedProfiles.length > 0) {
            setSelectedProfileId(updatedProfiles[0]._id);
          } else {
            setSelectedProfileId("");
          }
        }
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao deletar perfil");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Erro ao deletar perfil");
    }
  }

  function resetForm() {
    setNewProfileName("");
    setNewProfileDescription("");
    setNewProfileColor("#ffeda0");
    setEditingProfileId(null);
    setShowNewProfileForm(false);
  }

  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    setCreatingProfile(true);
    try {
      const isEditing = editingProfileId !== null;
      const url = isEditing 
        ? `/api/profiles/${editingProfileId}`
        : "/api/profiles";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProfileName,
          description: newProfileDescription || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedProfile = data.profile;
        
        // Garantir que o perfil tenha _id
        const profileWithId = {
          ...updatedProfile,
          _id: updatedProfile._id || updatedProfile.id,
        };
        
        if (isEditing) {
          // Atualizar o perfil na lista
          setProfiles(profiles.map((p) => 
            p._id === editingProfileId ? profileWithId : p
          ));
        } else {
          // Adicionar o novo perfil à lista
          setProfiles([profileWithId, ...profiles]);
          // Selecionar o novo perfil
          setSelectedProfileId(profileWithId._id);
        }
        
        // Limpar o formulário e fechar
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || `Erro ao ${isEditing ? "atualizar" : "criar"} perfil`);
      }
    } catch (error) {
      console.error(`Error ${editingProfileId ? "updating" : "creating"} profile:`, error);
      alert(`Erro ao ${editingProfileId ? "atualizar" : "criar"} perfil`);
    } finally {
      setCreatingProfile(false);
    }
  }

  function isPlatformConnected(platformId: string): boolean {
    return accounts.some((account) => account.platform === platformId);
  }

  const selectedProfile = profiles.find((p) => p._id === selectedProfileId);
  
  // Encontrar o primeiro perfil criado (mais antigo)
  const firstProfile = profiles.length > 0 
    ? [...profiles].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB; // Ordenar do mais antigo para o mais recente
      })[0]
    : null;
  
  const isFirstProfile = firstProfile && selectedProfile?._id === firstProfile._id;

  return (
    <>
      <div className="mb-6 lg:hidden">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-gray-900 dark:text-white font-mono text-sm">
            Dashboard
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 rounded-full text-xs font-mono border transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700">
            Posts
          </button>
          <button className="px-3 py-1.5 rounded-full text-xs font-mono border transition-colors bg-gray-900 dark:bg-gray-100 text-white dark:text-black border-gray-900 dark:border-gray-200">
            Connections
          </button>
          <button className="px-3 py-1.5 rounded-full text-xs font-mono border transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700">
            Analytics
          </button>
          <button className="px-3 py-1.5 rounded-full text-xs font-mono border transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700">
            Inbox
          </button>
          <button className="px-3 py-1.5 rounded-full text-xs font-mono border transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700">
            API Keys
          </button>
          <button className="px-3 py-1.5 rounded-full text-xs font-mono border transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700">
            Queues
          </button>
          <button className="px-3 py-1.5 rounded-full text-xs font-mono border transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700">
            Users
          </button>
          <button className="px-3 py-1.5 rounded-full text-xs font-mono border transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700">
            Webhooks
          </button>
          <button className="px-3 py-1.5 rounded-full text-xs font-mono border transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700">
            Logs
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 font-mono">
            Connections
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-mono text-sm sm:text-base">
            manage profiles and platform integrations
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowNewProfileForm(true);
          }}
          className="text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto text-center"
          title="Create a new profile"
          style={{ backgroundColor: "rgb(255, 237, 160)" }}
        >
          + new profile
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-mono">
            Select Profile
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => selectedProfileId && handleEditProfile(selectedProfileId)}
              disabled={!selectedProfileId}
              className="text-xs px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              title="Edit this profile"
            >
              edit
            </button>
            {profiles.length > 1 && (
              <button
                onClick={() => selectedProfileId && handleDeleteProfile(selectedProfileId)}
                disabled={!selectedProfileId}
                className="text-xs px-3 py-1 bg-white dark:bg-gray-800 border border-red-700 text-red-300 rounded hover:bg-red-900 transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete this profile"
              >
                delete
              </button>
            )}
          </div>
        </div>
        <div className="max-w-md">
          <div 
            className="relative" 
            ref={profileDropdownRef}
            onMouseEnter={() => {
              if (dropdownTimeoutRef.current) {
                clearTimeout(dropdownTimeoutRef.current);
                dropdownTimeoutRef.current = null;
              }
              setShowProfileDropdown(true);
            }}
            onMouseLeave={() => {
              dropdownTimeoutRef.current = setTimeout(() => {
                setShowProfileDropdown(false);
              }, 200);
            }}
          >
            <button
              type="button"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-mono text-sm focus:border-gray-300 dark:focus:border-gray-600 focus:outline-none"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "rgb(255, 237, 160)" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-left">
                        {selectedProfile?.name || "Select a profile"}
                      </span>
                      {isFirstProfile && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded flex-shrink-0">
                          default
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate block text-left">
                      Profile for {selectedProfile?.name || ""} integration
                    </span>
                  </div>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                  showProfileDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showProfileDropdown && (
              <div 
                className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
                onMouseEnter={() => {
                  if (dropdownTimeoutRef.current) {
                    clearTimeout(dropdownTimeoutRef.current);
                    dropdownTimeoutRef.current = null;
                  }
                }}
                onMouseLeave={() => {
                  dropdownTimeoutRef.current = setTimeout(() => {
                    setShowProfileDropdown(false);
                  }, 200);
                }}
              >
                {profiles.map((profile) => (
                  <button
                    key={profile._id}
                    type="button"
                    onClick={() => {
                      setSelectedProfileId(profile._id);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  >
                    {profile.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-mono hidden md:flex items-center gap-2">
            <span>profile id:</span>
            <span className="text-gray-700 dark:text-gray-300 break-all">
              {selectedProfileId}
            </span>
            <button
              type="button"
              onClick={copyProfileId}
              className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy Profile ID"
            >
              {copiedProfileId ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {showNewProfileForm && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-mono">
            {editingProfileId ? "Edit Profile" : "Create New Profile"}
          </h3>
          <form onSubmit={handleCreateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
              Profile Name
            </label>
            <input
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-300 dark:border-gray-600 focus:outline-none font-mono text-sm"
              placeholder="e.g., Personal, Business, Agency"
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
              Description
            </label>
            <input
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-300 dark:border-gray-600 focus:outline-none font-mono text-sm"
              placeholder="Optional description"
              type="text"
              value={newProfileDescription}
              onChange={(e) => setNewProfileDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
              Color
            </label>
            <input
              className="w-16 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
              type="color"
              value={newProfileColor}
              onChange={(e) => setNewProfileColor(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creatingProfile || !newProfileName.trim()}
              className="text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "rgb(255, 237, 160)" }}
            >
              {creatingProfile 
                ? (editingProfileId ? "Updating..." : "Creating...") 
                : (editingProfileId ? "Update Profile" : "Create Profile")}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="text-sm px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-mono"
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-mono">
          Platforms for {selectedProfile?.name || ""}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => {
            const isConnected = isPlatformConnected(platform.id);
            const connectedAccount = accounts.find((acc) => acc.platform === platform.id);
            const platformColors: Record<string, string> = {
              tiktok: "bg-black",
              instagram: "bg-gradient-to-br from-purple-600 to-pink-500",
              facebook: "bg-[#1877F2]",
              youtube: "bg-[#FF0000]",
              linkedin: "bg-[#0A66C2]",
              twitter: "bg-black",
              threads: "bg-black",
              bluesky: "bg-[#1185fe]",
              pinterest: "bg-[#E60023]",
              reddit: "bg-[#FF4500]",
              "google-business": "bg-[#4285F4]",
              telegram: "bg-[#26A5E4]",
            };
            const bgColor = platformColors[platform.id] || "bg-gray-600";

            // Função para obter o ícone SVG da plataforma
            const getPlatformIcon = () => {
              if (platform.id === "instagram") {
                return (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                );
              }
              return null;
            };

            const formatDate = (dateString?: string) => {
              if (!dateString) return "";
              const date = new Date(dateString);
              return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
            };

            return (
              <div
                key={platform.id}
                id={`platform-${platform.id}`}
                className="rounded-lg p-4 transition-all bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10">
                        {isConnected && connectedAccount?.metadata?.profilePicture ? (
                          <>
                            <img
                              src={connectedAccount.metadata.profilePicture}
                              alt={`${connectedAccount.metadata.displayName || connectedAccount.username || platform.name} profile`}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                            />
                            <div className={`platform-badge absolute -bottom-0.5 -right-0.5 w-4 h-4 ${bgColor} rounded-md flex items-center justify-center text-white shadow-lg`}>
                              <div className="scale-[0.5]">
                                {getPlatformIcon() || (
                                  <span className="text-xs font-bold">
                                    {platform.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center text-white border border-gray-200 dark:border-gray-700`}>
                              {getPlatformIcon() || (
                                <span className="text-lg font-bold">
                                  {platform.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="platform-icon-fallback hidden w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white border border-gray-200 dark:border-gray-700">
                              {getPlatformIcon()}
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium font-mono text-gray-900 dark:text-white">
                          {platform.name}
                        </h3>
                      </div>
                    </div>
                    {isConnected && (
                      <button
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="View account health"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                  {isConnected && connectedAccount ? (
                    <div className="space-y-2">
                      <div className="rounded-lg p-2 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                          @{connectedAccount.username || "N/A"}
                        </div>
                        {connectedAccount.createdAt && (
                          <div className="text-xs text-gray-500 font-mono">
                            {formatDate(connectedAccount.createdAt)}
                          </div>
                        )}
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-mono flex items-center gap-2">
                          <span>id:</span>
                          <span className="text-gray-700 dark:text-gray-300 break-all">
                            {connectedAccount._id.substring(0, 10)}...
                          </span>
                          <button
                            type="button"
                            onClick={() => copyAccountId(connectedAccount._id)}
                            className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Copy Account ID"
                          >
                            {copiedAccountId === connectedAccount._id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDisconnect(connectedAccount._id)}
                          className="w-full text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-mono"
                        >
                          disconnect
                        </button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="flex-1 text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-mono"
                          title="Create invitation link for someone else to connect their account"
                        >
                          <span className="flex items-center justify-center gap-1.5">
                            <LinkIcon className="w-3.5 h-3.5" />
                            invite
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleConnect(platform.id)}
                        className="w-full text-sm px-4 py-1.5 rounded-lg transition-colors font-mono text-black hover:opacity-90"
                        style={{ backgroundColor: "rgb(255, 237, 160)" }}
                      >
                        + connect
                      </button>
                      <button
                        className="w-full text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-mono"
                        title="Create invitation link for someone else to connect their account"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5" />
                          invite
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
                  value={selectedProfile?.name || ""}
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
                  onClick={handleCreateAccount}
                  disabled={creating || !selectedProfileId || !selectedPlatform}
                  className="text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "rgb(255, 237, 160)" }}
                >
                  {creating ? "Creating..." : "Connect"}
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
    </>
  );
}
