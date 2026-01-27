"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";

interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  async function loadApiKeys() {
    try {
      const res = await fetch("/api/api-keys");
      const data = await res.json();
      setApiKeys(data.apiKeys || []);
    } catch (error) {
      console.error("Error loading API keys:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (res.ok) {
        const data = await res.json();
        setApiKeys([data.apiKey, ...apiKeys]);
        setNewKeyName("");
        setShowNewForm(false);
      }
    } catch (error) {
      console.error("Error creating API key:", error);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(keyId: string) {
    if (!confirm("Are you sure you want to delete this API key?")) return;

    setDeleting(keyId);
    try {
      const res = await fetch(`/api/api-keys/${keyId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setApiKeys(apiKeys.filter((key) => key.id !== keyId));
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
    } finally {
      setDeleting(null);
    }
  }

  function copyToClipboard(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function formatKey(key: string): string {
    if (key.length <= 20) return key;
    // Mostrar início e fim da chave, similar ao HTML de referência
    return `${key.substring(0, 7)}...${key.substring(key.length - 7)}`;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
      <div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 font-mono text-gray-900 dark:text-white">
              API Keys
            </h1>
            <p className="font-mono text-sm sm:text-base text-gray-600 dark:text-gray-400">
              authentication tokens
            </p>
          </div>
          <div className="flex flex-col items-stretch md:items-end gap-1">
            <button
              title="Create a new API key"
              onClick={() => setShowNewForm(!showNewForm)}
              className="text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto text-center"
              style={{ backgroundColor: "rgb(255, 237, 160)" }}
            >
              + create key
            </button>
          </div>
        </div>

        {showNewForm && (
          <div className="border rounded-lg p-6 mb-8 bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 font-mono text-gray-900 dark:text-white">
              Create New API Key
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 font-mono text-gray-600 dark:text-gray-400">
                  Key Name
                </label>
                <input
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none font-mono text-sm bg-white border-gray-300 text-gray-900 focus:border-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-gray-600"
                  placeholder="e.g., Production API Key"
                  required
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating || !newKeyName.trim()}
                  className="text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "rgb(255, 237, 160)" }}
                >
                  create key
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewKeyName("");
                  }}
                  className="text-sm px-4 py-2 border rounded-lg transition-colors font-mono bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400 font-mono">
              Loading...
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="border rounded-lg p-6 bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 font-mono">
              No API keys created yet
            </div>
          ) : (
            apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="border rounded-lg p-4 sm:p-6 bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-2 sm:mb-4">
                  <div>
                    <h3 className="font-medium font-mono text-gray-900 dark:text-white mb-1">
                      {apiKey.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-mono break-all max-w-full text-gray-600 dark:text-gray-400">
                      {apiKey.key.length > 50
                        ? `${apiKey.key.substring(0, 7)}...${apiKey.key.substring(apiKey.key.length - 7)}`
                        : apiKey.key}
                    </p>
                    <p className="text-xs mt-1 font-mono text-gray-500 dark:text-gray-500">
                      Created {formatDate(apiKey.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end -mt-1 sm:-mt-2 sm:-mr-1.5">
                    <span className="px-2 py-1 rounded text-xs font-mono bg-green-500/20 text-green-700 dark:text-green-300 border border-green-600/30 dark:border-green-500/30 w-fit">
                      active
                    </span>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="text-sm px-2 py-1 border rounded transition-colors font-mono w-full sm:w-auto text-center bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center justify-center gap-1"
                      title="Copy API key"
                    >
                      {copiedKey === apiKey.key ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(apiKey.id)}
                      disabled={deleting === apiKey.id}
                      className="text-sm px-2 py-1 border rounded transition-colors font-mono w-full sm:w-auto text-center bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

