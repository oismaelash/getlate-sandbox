"use client";

import { useState, useEffect } from "react";
import { RefreshCw, X, Check, Zap, Edit, Trash2, ChevronDown } from "lucide-react";

type Tab = "webhooks" | "logs";
type FilterStatus = "all" | "success" | "failed";

type WebhookEvent =
  | "post.scheduled"
  | "post.published"
  | "post.failed"
  | "post.partial_publish"
  | "account.connected"
  | "account.disconnected"
  | "message.received";

interface CustomHeader {
  key: string;
  value: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  secretKey?: string;
  customHeaders: CustomHeader[];
  events: WebhookEvent[];
  enabled: boolean;
  createdAt: string;
}

interface DeliveryLog {
  id: string;
  status: "success" | "failed";
  statusCode: number;
  event: string;
  timestamp: string;
  responseTime: number;
  attempts: number;
  url: string;
  requestPayload: object;
  response: string;
}

export default function WebhooksPage() {
  const [activeTab, setActiveTab] = useState<Tab>("webhooks");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [name, setName] = useState("My Webhook");
  const [url, setUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [customHeaders, setCustomHeaders] = useState<CustomHeader[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([]);
  const [enabled, setEnabled] = useState(true);

  const webhookEvents: { value: WebhookEvent; label: string }[] = [
    { value: "post.scheduled", label: "Post Scheduled" },
    { value: "post.published", label: "Post Published" },
    { value: "post.failed", label: "Post Failed" },
    { value: "post.partial_publish", label: "Partial Publish" },
    { value: "account.connected", label: "Account Connected" },
    { value: "account.disconnected", label: "Account Disconnected" },
    { value: "message.received", label: "Message Received" },
  ];

  useEffect(() => {
    loadWebhooks();
    loadDeliveryLogs();
  }, []);

  async function loadWebhooks() {
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch (error) {
      console.error("Error loading webhooks:", error);
    }
  }

  async function loadDeliveryLogs() {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      const res = await fetch(`/api/webhooks/delivery-logs?${params.toString()}`);
      const data = await res.json();
      const logs = (data.logs || []).map((log: any) => ({
        id: log.id,
        status: log.status as "success" | "failed",
        statusCode: log.statusCode || 0,
        event: log.event,
        timestamp: log.timestamp,
        responseTime: log.responseTime || 0,
        attempts: log.attempts || 1,
        url: log.webhook?.url || "",
        requestPayload: log.requestPayload,
        response: log.response || "",
      }));
      setDeliveryLogs(logs);
    } catch (error) {
      console.error("Error loading delivery logs:", error);
    }
  }

  useEffect(() => {
    if (activeTab === "logs") {
      loadDeliveryLogs();
    }
  }, [filterStatus, activeTab]);

  function handleOpenForm() {
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingWebhook(null);
    // Reset form
    setName("My Webhook");
    setUrl("");
    setSecretKey("");
    setCustomHeaders([]);
    setSelectedEvents([]);
    setEnabled(true);
  }

  function handleEdit(webhook: Webhook) {
    setEditingWebhook(webhook);
    setName(webhook.name);
    setUrl(webhook.url);
    setSecretKey(webhook.secretKey || "");
    setCustomHeaders(webhook.customHeaders);
    setSelectedEvents(webhook.events);
    setEnabled(webhook.enabled);
    setShowForm(true);
  }

  function handleDelete(webhookId: string) {
    if (!confirm("Are you sure you want to delete this webhook?")) return;
    setWebhooks(webhooks.filter((w) => w.id !== webhookId));
  }

  function handleToggleEnabled(webhookId: string) {
    setWebhooks(
      webhooks.map((w) =>
        w.id === webhookId ? { ...w, enabled: !w.enabled } : w
      )
    );
  }

  async function handleTest(webhookId: string) {
    try {
      const res = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: "POST",
      });

      if (res.ok) {
        // Reload delivery logs to show the new test delivery
        await loadDeliveryLogs();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to test webhook");
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
      alert("Error testing webhook");
    }
  }

  function toggleLogExpanded(logId: string) {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  const filteredLogs = deliveryLogs.filter((log) => {
    if (filterStatus === "all") return true;
    return log.status === filterStatus;
  });

  function handleToggleEvent(event: WebhookEvent) {
    setSelectedEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  }

  function handleAddHeader() {
    setCustomHeaders([...customHeaders, { key: "", value: "" }]);
  }

  function handleRemoveHeader(index: number) {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  }

  function handleUpdateHeader(index: number, field: "key" | "value", value: string) {
    setCustomHeaders(
      customHeaders.map((header, i) =>
        i === index ? { ...header, [field]: value } : header
      )
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const webhookData: Webhook = {
      id: editingWebhook?.id || `webhook-${Date.now()}`,
      name,
      url,
      secretKey: secretKey || undefined,
      customHeaders,
      events: selectedEvents,
      enabled,
      createdAt: editingWebhook?.createdAt || new Date().toISOString(),
    };

    if (editingWebhook) {
      setWebhooks(webhooks.map((w) => (w.id === editingWebhook.id ? webhookData : w)));
    } else {
      setWebhooks([...webhooks, webhookData]);
    }

    handleCloseForm();
  }

  function formatEventLabel(event: WebhookEvent): string {
    const eventMap: Record<WebhookEvent, string> = {
      "post.scheduled": "post.scheduled",
      "post.published": "post.published",
      "post.failed": "post.failed",
      "post.partial_publish": "post.partial",
      "account.connected": "account.connected",
      "account.disconnected": "account.disconnected",
      "message.received": "message.received",
    };
    return eventMap[event] || event;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
      <div>
        {/* Tabs */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("webhooks")}
            className={`px-4 py-2 rounded-md text-sm font-mono transition-colors ${
              activeTab === "webhooks"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Webhooks
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-md text-sm font-mono transition-colors ${
              activeTab === "logs"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Delivery Logs
          </button>
        </div>

        {/* Webhooks Tab */}
        {activeTab === "webhooks" && (
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 font-mono">
                      Webhooks
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-mono text-sm sm:text-base">
                      Get notified when events happen
                    </p>
                  </div>
                  <button
                    onClick={handleOpenForm}
                    className="text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90"
                    style={{ backgroundColor: "rgb(255, 237, 160)" }}
                  >
                    + Add Webhook
                  </button>
                </div>

            {/* Create Webhook Form */}
            {showForm ? (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-mono">
                  {editingWebhook ? "Edit Webhook" : "New Webhook"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
                      Name
                    </label>
                    <input
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none font-mono text-sm"
                      placeholder="My Webhook"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
                      URL
                    </label>
                    <input
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none font-mono text-sm"
                      placeholder="https://myapp.com/webhooks/late"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
                      Secret Key (Optional)
                    </label>
                    <input
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none font-mono text-sm"
                      placeholder="your-secret-key"
                      type="password"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500 font-mono">
                      Used to generate HMAC signature in X-Late-Signature header
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-mono">
                      Custom Headers (Optional)
                    </label>
                    <div className="space-y-2">
                      {customHeaders.map((header, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none font-mono text-sm"
                            placeholder="Header name"
                            type="text"
                            value={header.key}
                            onChange={(e) =>
                              handleUpdateHeader(index, "key", e.target.value)
                            }
                          />
                          <input
                            className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none font-mono text-sm"
                            placeholder="Header value"
                            type="text"
                            value={header.value}
                            onChange={(e) =>
                              handleUpdateHeader(index, "value", e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveHeader(index)}
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-mono text-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddHeader}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-mono text-sm"
                      >
                        + Add Header
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 font-mono">
                      Events
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {webhookEvents.map((event) => (
                        <label
                          key={event.value}
                          className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <input
                            className="w-4 h-4 rounded border-gray-400 dark:border-gray-600"
                            type="checkbox"
                            checked={selectedEvents.includes(event.value)}
                            onChange={() => handleToggleEvent(event.value)}
                            style={{ accentColor: "rgb(255, 237, 160)" }}
                          />
                          <span className="text-sm text-gray-900 dark:text-white font-mono">
                            {event.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      className="w-4 h-4 rounded border-gray-400 dark:border-gray-600"
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      style={{ accentColor: "rgb(255, 237, 160)" }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white font-mono">
                      Enable this webhook
                    </span>
                  </label>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90"
                      style={{ backgroundColor: "rgb(255, 237, 160)" }}
                    >
                      {editingWebhook ? "Update Webhook" : "Create Webhook"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="text-sm px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-mono"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {webhooks.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400 font-mono mb-4">
                        No webhooks configured
                      </p>
                      <button
                        onClick={handleOpenForm}
                        className="text-sm px-4 py-2 rounded-lg transition-colors font-mono text-black hover:opacity-90"
                        style={{ backgroundColor: "rgb(255, 237, 160)" }}
                      >
                        Create your first webhook
                      </button>
                    </div>
                  ) : (
                    webhooks.map((webhook) => (
                      <div key={webhook.id}>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-gray-900 dark:text-white font-mono font-medium truncate">
                                  {webhook.name}
                                </h3>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-mono ${
                                    webhook.enabled
                                      ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  {webhook.enabled ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 text-sm font-mono truncate mb-2">
                                {webhook.url}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {webhook.events.map((event) => (
                                  <span
                                    key={event}
                                    className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-mono"
                                  >
                                    {formatEventLabel(event)}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleToggleEnabled(webhook.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  webhook.enabled
                                    ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                                title={webhook.enabled ? "Disable" : "Enable"}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleTest(webhook.id)}
                                className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Test webhook"
                              >
                                <Zap className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(webhook)}
                                className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                title="Edit webhook"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(webhook.id)}
                                className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                                title="Delete webhook"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 mt-6">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-4 font-mono text-sm">
                            Webhook Payload Example
                          </h3>
                          <pre className="text-xs overflow-x-auto bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg font-mono text-gray-700 dark:text-gray-300">
{`{
  "event": "post.published",
  "post": {
    "id": "abc123",
    "content": "Hello world!",
    "status": "published",
    "scheduledFor": "2024-12-15T10:00:00Z",
    "publishedAt": "2024-12-15T10:00:12Z",
    "platforms": [
      {
        "platform": "twitter",
        "status": "published",
        "publishedUrl": "https://twitter.com/..."
      }
    ]
  },
  "timestamp": "2024-12-15T10:00:12Z"
}`}
                          </pre>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Delivery Logs Tab */}
        {activeTab === "logs" && (
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                  Delivery Logs
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                  recent webhook deliveries
                </p>
              </div>
              <button
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-mono text-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg text-sm font-mono transition-colors border ${
                  filterStatus === "all"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("success")}
                className={`px-4 py-2 rounded-lg text-sm font-mono transition-colors border ${
                  filterStatus === "success"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Success
              </button>
              <button
                onClick={() => setFilterStatus("failed")}
                className={`px-4 py-2 rounded-lg text-sm font-mono transition-colors border ${
                  filterStatus === "failed"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Failed
              </button>
            </div>
            {filteredLogs.length === 0 ? (
              <div className="text-center p-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-gray-500 font-mono">
                  No webhook logs yet. Create a post to trigger webhooks!
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid md:grid-cols-6 gap-4 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-mono text-gray-600 dark:text-gray-400">
                  <div>Status</div>
                  <div>Event</div>
                  <div>Time</div>
                  <div>Response Time</div>
                  <div>Attempts</div>
                  <div>Details</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredLogs.map((log) => {
                    const isExpanded = expandedLogs.has(log.id);
                    return (
                      <div key={log.id}>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border ${
                                log.status === "success"
                                  ? "bg-white text-green-600 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700"
                                  : "bg-white text-red-600 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                              }`}
                            >
                              {log.status === "success" ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              {log.status === "success" ? "Success" : "Failed"}
                            </span>
                            <span className="text-xs font-mono text-gray-500">
                              {log.statusCode}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                              {log.event}
                            </code>
                          </div>
                          <div className="flex items-center text-sm font-mono text-gray-600 dark:text-gray-400">
                            {formatTimestamp(log.timestamp)}
                          </div>
                          <div className="flex items-center text-sm font-mono text-gray-600 dark:text-gray-400">
                            {log.responseTime}ms
                          </div>
                          <div className="flex items-center text-sm font-mono text-gray-600 dark:text-gray-400">
                            {log.attempts}
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleLogExpanded(log.id)}
                              className="px-3 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
                            >
                              {isExpanded ? "Hide" : "Show"}
                              <ChevronDown
                                className={`w-3 h-3 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-4 py-4 bg-gray-100/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 space-y-4">
                            <div>
                              <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mb-1">
                                URL
                              </p>
                              <code className="block text-xs font-mono bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded text-gray-700 dark:text-gray-300 overflow-x-auto">
                                {log.url}
                              </code>
                            </div>
                            <div>
                              <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mb-1">
                                Request Payload
                              </p>
                              <pre className="text-xs font-mono bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded text-gray-700 dark:text-gray-300 overflow-x-auto max-h-64">
                                {JSON.stringify(log.requestPayload, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mb-1">
                                Response
                              </p>
                              <pre className="text-xs font-mono bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded text-gray-700 dark:text-gray-300 overflow-x-auto max-h-64">
                                {log.response}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
