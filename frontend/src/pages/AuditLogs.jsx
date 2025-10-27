// src/pages/AuditLogs.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/api-key/admin/audit-logs");
        setLogs(res.data.logs || []);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch audit logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 lg:p-8 pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Minimal Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 rounded-xl">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Audit Logs</h1>
            <p className="text-slate-600 text-sm mt-1">Track all API key activities and user actions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Logs</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{logs.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Unique Users</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {new Set(logs.map(log => log.userId?._id)).size}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Latest Activity</p>
                <p className="text-sm text-slate-800 mt-1">
                  {logs.length > 0 
                    ? new Date(logs[0].timestamp).toLocaleDateString() 
                    : 'No activity'
                  }
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Recent Activities</h2>
            
            {/* Mobile Stats Summary */}
            <div className="flex gap-2 lg:hidden">
              <span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">
                {logs.length} log{logs.length !== 1 ? 's' : ''}
              </span>
              <span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">
                {new Set(logs.map(log => log.userId?._id)).size} users
              </span>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 text-slate-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Audit Logs Found</h3>
              <p className="text-slate-500 mb-4">Activity logs will appear here as users perform actions</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to Dashboard
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">User</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Email</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Action</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Details</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="font-medium text-slate-800">
                            {log.userId?.name || "Unknown User"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-600">{log.userId?.email || "-"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          log.action?.includes('create') || log.action?.includes('add') 
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action?.includes('delete') || log.action?.includes('revoke')
                            ? 'bg-rose-100 text-rose-800'
                            : log.action?.includes('update') || log.action?.includes('rotate')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="max-w-xs">
                          <details className="group">
                            <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800 transition-colors duration-200">
                              View Details
                            </summary>
                            <pre className="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-700 overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-slate-600">
                          <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                          <div className="text-slate-500 text-xs">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {logs.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Showing {logs.length} audit log{logs.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}