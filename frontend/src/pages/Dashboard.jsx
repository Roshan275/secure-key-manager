//src/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const navigate = useNavigate();

  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showKey, setShowKey] = useState(null);
  const [rotationHistory, setRotationHistory] = useState([]);
  const [showHistoryKey, setShowHistoryKey] = useState(null);
  const [expiredKeys, setExpiredKeys] = useState([]);
  const [showExpired, setShowExpired] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchService, setSearchService] = useState("");
  const [searchUserId, setSearchUserId] = useState("");

  const [newKey, setNewKey] = useState({
    name: "",
    service: "",
    key: "",
    expiresAt: "",
  });

  useEffect(() => {
    fetchApiKeys();
    if (user?.role === "admin") fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api-key/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api-key");
      setApiKeys(res.data.keys || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api-key/add", newKey);
      alert("✅ API Key added successfully!");
      setShowForm(false);
      setNewKey({ name: "", service: "", key: "", expiresAt: "" });
      fetchApiKeys();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add key");
    }
  };

  const handleDecrypt = async (id) => {
    try {
      const res = await api.get(`/api-key/decrypt/${id}`);
      setShowKey(res.data.decryptedKey);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to decrypt key");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("⚠️ Are you sure you want to delete this key?")) return;
    try {
      await api.delete(`/api-key/${id}`);
      setApiKeys(apiKeys.filter((k) => k._id !== id));
      alert("🗑️ Key deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete key");
    }
  };

  const handleRotate = async (id) => {
    const newKey = prompt("Enter new API key for rotation:");
    if (!newKey) return alert("Rotation cancelled");

    const expiresAt = prompt(
      "Enter new expiry date (YYYY-MM-DD) or leave blank:"
    );
    try {
      await api.put(`/api-key/rotate/${id}`, {
        newKey,
        expiresAt: expiresAt || null,
      });
      alert("🔄 API Key rotated successfully!");
      fetchApiKeys();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to rotate key");
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm("⚠️ Are you sure you want to revoke this key?")) return;

    try {
      await api.put(`/api-key/revoke/${id}`);
      alert("🚫 API Key revoked successfully!");
      fetchApiKeys();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to revoke key");
    }
  };

  const handleViewHistory = async (id) => {
    try {
      const res = await api.get(`/api-key/history/${id}`);
      setRotationHistory(res.data.rotationHistory);
      setShowHistoryKey(`${res.data.keyName} (${res.data.service})`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch rotation history");
    }
  };

  const handleViewExpired = async () => {
    try {
      const res = await api.get("/api-key/expired");
      setExpiredKeys(res.data.keys || []);
      setShowExpired(true);
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to fetch expired/revoked keys"
      );
    }
  };

  const handleSearch = async () => {
    try {
      let url = "/api-key/search";
      if (user?.role === "admin") {
        url = "/api-key/admin/search";
      }

      const params = {};
      if (searchName) params.name = searchName;
      if (searchService) params.service = searchService;
      if (user?.role === "admin" && selectedUser)
        params.userNameOrEmail = selectedUser;

      const res = await api.get(url, { params });
      setApiKeys(res.data.keys || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to search API keys");
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get("/api-key/admin/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "api_keys_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export keys: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading API keys...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
          <div className="text-red-500 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-lg font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 lg:p-8 pt-16 lg:pt-20">
      {/* Header Section */}
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <svg
                  className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              API Key Management
            </h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              {user?.role === "admin"
                ? "Manage all API keys across your organization"
                : "View, rotate, and manage your API keys securely"}
            </p>
          </div>

          {/* Fixed Mobile Dropdown Version */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Primary Action - Enhanced */}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl order-first"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Key
            </button>

            {/* Admin Actions with Fixed Dropdown on Mobile */}
            {/* Ultra Mobile-Optimized Dropdown */}
            {user?.role === "admin" && (
              <div className="sm:hidden w-full max-w-full">
                <div className="relative w-full">
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "audit") navigate("/audit-logs");
                      if (value === "export") handleExport();
                      if (value === "expired") handleViewExpired();
                      e.target.value = "";
                    }}
                    className="w-full max-w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer shadow-sm transition-all duration-200 font-medium text-slate-700 text-base"
                    style={{ maxWidth: "100%" }}
                  >
                    <option value="">⚙️ Admin Actions</option>
                    <option value="audit">📊 Audit Logs</option>
                    <option value="export">📥 Export CSV</option>
                    <option value="expired">⚠️ Expired Keys</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Desktop Admin Buttons */}
            {user?.role === "admin" && (
              <div className="hidden sm:flex gap-3 flex-wrap">
                <button
                  onClick={() => navigate("/audit-logs")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-slate-50 to-white text-slate-700 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 font-medium group"
                >
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  Audit Logs
                </button>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl transition-all duration-200 font-medium group"
                >
                  <div className="p-1.5 bg-emerald-400/20 rounded-lg group-hover:bg-emerald-400/30 transition-colors duration-200">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  Export CSV
                </button>

                <button
                  onClick={handleViewExpired}
                  className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-rose-500 to-rose-600 text-white rounded-xl shadow-lg hover:from-rose-600 hover:to-rose-700 hover:shadow-xl transition-all duration-200 font-medium group"
                >
                  <div className="p-1.5 bg-rose-400/20 rounded-lg group-hover:bg-rose-400/30 transition-colors duration-200">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  Expired Keys
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Key Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">
                Add New API Key
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={handleAddKey}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Production API Key"
                  value={newKey.name}
                  onChange={(e) =>
                    setNewKey({ ...newKey, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Service *
                </label>
                <input
                  type="text"
                  placeholder="e.g., AWS, Stripe, GitHub"
                  value={newKey.service}
                  onChange={(e) =>
                    setNewKey({ ...newKey, service: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  API Key *
                </label>
                <input
                  type="text"
                  placeholder="Enter your API key"
                  value={newKey.key}
                  onChange={(e) =>
                    setNewKey({ ...newKey, key: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={newKey.expiresAt}
                  onChange={(e) =>
                    setNewKey({ ...newKey, expiresAt: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div className="flex gap-3 md:col-span-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
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
                  Save API Key
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Search by Name
              </label>
              <input
                type="text"
                placeholder="Key name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Search by Service
              </label>
              <input
                type="text"
                placeholder="Service name..."
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {user?.role === "admin" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                >
                  <option value="">All Users</option>
                  {users.map((u) => (
                    <option key={u._id} value={u.name}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </button>
              <button
                onClick={() => {
                  setSearchName("");
                  setSearchService("");
                  setSelectedUser("");
                  fetchApiKeys();
                }}
                className="px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200 font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* API Keys Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 text-slate-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                No API Keys Found
              </h3>
              <p className="text-slate-500 mb-6">
                Get started by adding your first API key
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Add Your First Key
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">
                      Name
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">
                      Service
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">
                      Created At
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {apiKeys.map((key) => (
                    <tr
                      key={key._id}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium text-slate-800">
                            {key.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                          {key.service}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {new Date(key.createdAt).toLocaleDateString()} at{" "}
                        {new Date(key.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleDecrypt(key._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all duration-200 text-sm font-medium"
                          >
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => handleRotate(key._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-all duration-200 text-sm font-medium"
                          >
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
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Rotate
                          </button>
                          <button
                            onClick={() => handleRevoke(key._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200 text-sm font-medium"
                          >
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
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            Revoke
                          </button>
                          <button
                            onClick={() => handleViewHistory(key._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all duration-200 text-sm font-medium"
                          >
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            History
                          </button>
                          <button
                            onClick={() => handleDelete(key._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-all duration-200 text-sm font-medium"
                          >
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
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Decrypted Key Modal */}
      {showKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-scale-in">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Decrypted API Key
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-3">
                Keep this key secure and do not share it:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="font-mono text-sm break-all text-slate-800">
                  {showKey}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowKey(null)}
                className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotation History Modal */}
      {rotationHistory.length > 0 && showHistoryKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Rotation History
                    </h3>
                    <p className="text-sm text-slate-600">{showHistoryKey}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRotationHistory([]);
                    setShowHistoryKey(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-96">
              <div className="p-6 space-y-4">
                {rotationHistory.map((h, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        Rotation #{rotationHistory.length - idx}
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(h.rotatedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-mono text-sm break-all text-slate-800 bg-white p-3 rounded border">
                      {h.decryptedKey}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expired / Revoked Keys Modal */}
      {showExpired && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-rose-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Expired / Revoked API Keys
                  </h3>
                </div>
                <button
                  onClick={() => setShowExpired(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-96">
              {expiredKeys.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 text-slate-300">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-600">
                    No expired or revoked keys found.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-6 text-left text-sm font-semibold text-slate-700">
                          Name
                        </th>
                        <th className="py-3 px-6 text-left text-sm font-semibold text-slate-700">
                          Service
                        </th>
                        <th className="py-3 px-6 text-left text-sm font-semibold text-slate-700">
                          Created At
                        </th>
                        <th className="py-3 px-6 text-left text-sm font-semibold text-slate-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {expiredKeys.map((key) => (
                        <tr
                          key={key._id}
                          className="hover:bg-slate-50 transition-colors duration-150"
                        >
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                  />
                                </svg>
                              </div>
                              <span className="font-medium text-slate-800">
                                {key.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                              {key.service}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-slate-600">
                            {new Date(key.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-6">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                key.revoked
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {key.revoked ? "Revoked" : "Expired"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-slate-200">
              <button
                onClick={() => setShowExpired(false)}
                className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
