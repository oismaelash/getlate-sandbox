"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ACCENT = "rgb(255, 237, 160)";

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
  { id: "snapchat", name: "Snapchat" },
];

interface SocialAccount {
  _id: string;
  platform: string;
  username: string | null;
  status: string | null;
  profileId: string;
}

export default function MockOAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const platform = searchParams?.get("platform") || "";
  const profileId = searchParams?.get("profileId") || "";
  const redirectUrl = searchParams?.get("redirect_url") || "/dashboard/accounts";

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAccountPlatform, setNewAccountPlatform] = useState(
    platform || "instagram"
  );
  const [newAccountUsername, setNewAccountUsername] = useState("");
  const [newAccountDisplayName, setNewAccountDisplayName] = useState("");
  const [newAccountProfilePicture, setNewAccountProfilePicture] = useState("");

  useEffect(() => {
    loadAccounts();
  }, [platform]);

  async function loadAccounts() {
    try {
      const res = await fetch("/api/accounts");
      if (!res.ok) {
        throw new Error("Failed to load accounts");
      }

      const data = await res.json();
      let allAccounts: SocialAccount[] = data.accounts || [];

      if (platform) {
        allAccounts = allAccounts.filter(
          (acc) => acc.platform.toLowerCase() === platform.toLowerCase()
        );
      }

      setAccounts(allAccounts);
    } catch (err) {
      console.error("Error loading accounts:", err);
      setError("Erro ao carregar contas");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount() {
    if (!profileId) {
      setError("profileId não encontrado na URL");
      return;
    }

    if (!newAccountPlatform) {
      setError("Platform é obrigatório");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profileId,
          platform: newAccountPlatform,
          username: newAccountUsername || undefined,
          displayName: newAccountDisplayName || undefined,
          profilePicture: newAccountProfilePicture || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao criar conta");
      }

      const data = await res.json();
      const newAccount = data.account;

      await loadAccounts();

      setSelectedAccountId(newAccount._id);
      setShowNewForm(false);
      setNewAccountUsername("");
      setNewAccountDisplayName("");
      setNewAccountProfilePicture("");
    } catch (err) {
      console.error("Error creating account:", err);
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setCreating(false);
    }
  }

  async function handleAuthorize() {
    if (!selectedAccountId) {
      setError("Selecione uma conta para autorizar");
      return;
    }

    if (!profileId) {
      setError("profileId não encontrado na URL");
      return;
    }

    setAuthorizing(true);
    setError(null);

    try {
      const res = await fetch("/api/mock/oauth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialAccountId: selectedAccountId,
          profileId: profileId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao autorizar");
      }

      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/dashboard/accounts");
      }
    } catch (err) {
      console.error("Error authorizing:", err);
      setError(err instanceof Error ? err.message : "Erro ao autorizar");
    } finally {
      setAuthorizing(false);
    }
  }

  function handleCloseForm() {
    setShowNewForm(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#222222] text-white flex items-center justify-center">
        <p className="text-gray-400 font-mono">Carregando contas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222] text-white p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 font-mono">
                Autorizar Conexão
              </h1>
              <p className="text-gray-400 font-mono text-sm sm:text-base">
                Selecione uma conta{platform ? ` (${platform})` : ""} para
                conectar ao profile
              </p>
              {profileId && (
                <p className="text-sm text-gray-400 mt-2 font-mono">
                  Profile ID: {profileId}
                </p>
              )}
            </div>
            <button
              onClick={() => (showNewForm ? handleCloseForm() : setShowNewForm(true))}
              className={
                showNewForm
                  ? "text-sm px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 font-mono shrink-0 transition-colors"
                  : "text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90 shrink-0"
              }
              style={showNewForm ? undefined : { backgroundColor: ACCENT }}
              type="button"
            >
              {showNewForm ? "Cancelar" : "+ Criar Nova Conta"}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300 font-mono text-sm">
              {error}
            </div>
          )}

          {/* Create form */}
          {showNewForm && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4 font-mono">
                Nova Conta Social
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-mono">
                    Platform *
                  </label>
                  <select
                    value={newAccountPlatform}
                    onChange={(e) => setNewAccountPlatform(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-gray-600 focus:outline-none font-mono text-sm"
                    disabled={!!platform}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {platform && (
                    <p className="mt-1 text-xs text-gray-400 font-mono">
                      Platform fixado: {platform}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-mono">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newAccountUsername}
                    onChange={(e) => setNewAccountUsername(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-gray-600 focus:outline-none font-mono text-sm placeholder-gray-400"
                    placeholder="Ex: username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-mono">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newAccountDisplayName}
                    onChange={(e) => setNewAccountDisplayName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-gray-600 focus:outline-none font-mono text-sm placeholder-gray-400"
                    placeholder="Nome de exibição"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-mono">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    value={newAccountProfilePicture}
                    onChange={(e) => setNewAccountProfilePicture(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-gray-600 focus:outline-none font-mono text-sm placeholder-gray-400"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCreateAccount}
                    disabled={creating || !newAccountPlatform}
                    className="text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: ACCENT }}
                    type="button"
                  >
                    {creating ? "Criando..." : "Criar Conta"}
                  </button>
                  <button
                    onClick={handleCloseForm}
                    type="button"
                    className="text-sm px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 font-mono"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {accounts.length === 0 && !showNewForm && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-400 font-mono mb-4">
                Nenhuma conta{platform ? ` do tipo ${platform}` : ""} encontrada.
              </p>
              <button
                onClick={() => setShowNewForm(true)}
                className="text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
                type="button"
              >
                Criar sua primeira conta
              </button>
            </div>
          )}

          {/* Account list */}
          {accounts.length > 0 && (
            <>
              <div className="space-y-4 mb-6">
                {accounts.map((account) => (
                  <label
                    key={account._id}
                    className={`block cursor-pointer rounded-lg border p-4 transition-colors ${
                      selectedAccountId === account._id
                        ? "border-2 bg-gray-900"
                        : "border border-gray-700 bg-gray-900 hover:border-gray-600"
                    }`}
                    style={
                      selectedAccountId === account._id
                        ? { borderColor: ACCENT }
                        : undefined
                    }
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="account"
                        value={account._id}
                        checked={selectedAccountId === account._id}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="mt-1 w-4 h-4 rounded border-gray-600"
                        style={{ accentColor: ACCENT }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono font-medium text-white capitalize truncate">
                            {account.platform}
                          </span>
                          {account.username && (
                            <span className="text-gray-400 font-mono text-sm">
                              @{account.username}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-mono ${
                              account.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {account.status || "active"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono truncate">
                          {account._id}
                        </p>
                        {account.profileId && (
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            Conectado ao profile: {account.profileId}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => router.back()}
                  type="button"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 font-mono text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAuthorize}
                  disabled={!selectedAccountId || authorizing}
                  type="button"
                  className="flex-1 text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: ACCENT }}
                >
                  {authorizing ? "Autorizando..." : "Autorizar"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
