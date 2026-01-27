"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    apiKeys: 0,
    profiles: 0,
    accounts: 0,
    posts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [apiKeysRes, profilesRes, accountsRes, postsRes] = await Promise.all([
        fetch("/api/api-keys"),
        fetch("/api/profiles"),
        fetch("/api/accounts"),
        fetch("/api/posts"),
      ]);

      const apiKeysData = await apiKeysRes.json();
      const profilesData = await profilesRes.json();
      const accountsData = await accountsRes.json();
      const postsData = await postsRes.json();

      setStats({
        apiKeys: apiKeysData.apiKeys?.length || 0,
        profiles: profilesData.profiles?.length || 0,
        accounts: accountsData.accounts?.length || 0,
        posts: postsData.posts?.length || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">GetLate Sandbox</h1>
          <p className="text-gray-600 dark:text-gray-400">Dashboard de gerenciamento</p>
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link href="/dashboard/api-keys">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h3 className="text-lg font-semibold mb-2">API Keys</h3>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.apiKeys}</p>
                </div>
              </Link>

              <Link href="/dashboard/profiles">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h3 className="text-lg font-semibold mb-2">Profiles</h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.profiles}</p>
                </div>
              </Link>

              <Link href="/dashboard/accounts">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h3 className="text-lg font-semibold mb-2">Social Accounts</h3>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.accounts}</p>
                </div>
              </Link>

              <Link href="/dashboard/posts">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h3 className="text-lg font-semibold mb-2">Posts</h3>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.posts}</p>
                </div>
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Navegação Rápida</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/api-keys"
                  className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <h3 className="font-semibold mb-1">API Keys</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie suas chaves de API</p>
                </Link>

                <Link
                  href="/dashboard/profiles"
                  className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <h3 className="font-semibold mb-1">Profiles</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie seus perfis GetLate</p>
                </Link>

                <Link
                  href="/dashboard/accounts"
                  className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <h3 className="font-semibold mb-1">Social Accounts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie contas sociais conectadas</p>
                </Link>

                <Link
                  href="/dashboard/posts"
                  className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <h3 className="font-semibold mb-1">Posts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Crie e gerencie posts agendados</p>
                </Link>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Como usar</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>Crie uma API Key na página de API Keys</li>
                <li>Crie um Profile na página de Profiles</li>
                <li>Conecte uma Social Account na página de Accounts</li>
                <li>Crie e agende posts na página de Posts</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
