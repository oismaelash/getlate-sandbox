"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const redirectUrl = searchParams?.get("redirect_url") || "/accounts";
  
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAccountPlatform, setNewAccountPlatform] = useState(platform || "instagram");
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
      
      // Filter by platform if specified
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

      // Reload accounts list
      await loadAccounts();

      // Auto-select the newly created account
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

      // Success - redirect
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/accounts");
      }
    } catch (err) {
      console.error("Error authorizing:", err);
      setError(err instanceof Error ? err.message : "Erro ao autorizar");
    } finally {
      setAuthorizing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Carregando contas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Autorizar Conexão</h1>
          <p className="text-gray-600">
            Selecione uma conta {platform && `(${platform})`} para conectar ao profile
          </p>
          {profileId && (
            <p className="text-sm text-gray-500 mt-2 font-mono">
              Profile ID: {profileId}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4">
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          >
            {showNewForm ? "Cancelar" : "Criar Nova Conta"}
          </button>
        </div>

        {showNewForm && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Nova Conta Social</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Platform *</label>
                <select
                  value={newAccountPlatform}
                  onChange={(e) => setNewAccountPlatform(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  disabled={!!platform}
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="tiktok">TikTok</option>
                </select>
                {platform && (
                  <p className="text-xs text-gray-500 mt-1">
                    Platform fixado: {platform}
                  </p>
                )}
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
                  placeholder="Nome de exibição"
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
                onClick={handleCreateAccount}
                disabled={creating || !newAccountPlatform}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {creating ? "Criando..." : "Criar Conta"}
              </button>
            </div>
          </div>
        )}

        {accounts.length === 0 && !showNewForm && (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">
              Nenhuma conta {platform && `do tipo ${platform}`} encontrada.
            </p>
            <p className="text-sm">
              Use o botão "Criar Nova Conta" acima para criar uma conta.
            </p>
          </div>
        )}

        {accounts.length > 0 && (
          <>
            <div className="mb-6 space-y-3">
              {accounts.map((account) => (
                <label
                  key={account._id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedAccountId === account._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="account"
                      value={account._id}
                      checked={selectedAccountId === account._id}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold capitalize">
                          {account.platform}
                        </span>
                        {account.username && (
                          <span className="text-gray-600">@{account.username}</span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            account.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {account.status || "active"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">
                        {account._id}
                      </p>
                      {account.profileId && (
                        <p className="text-xs text-gray-400 mt-1">
                          Atualmente conectado ao profile: {account.profileId}
                        </p>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAuthorize}
                disabled={!selectedAccountId || authorizing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authorizing ? "Autorizando..." : "Autorizar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

