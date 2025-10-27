//src/pages/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/api";
import FlashMessage from "../components/FlashMessage.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      setUser(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header - Centered for Mobile */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <svg
                className="w-8 h-8 text-blue-600"
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
            <h1 className="text-3xl font-bold text-slate-800">
              Secure Key Manager
            </h1>
          </div>

          <p className="text-lg text-slate-600">
            Enterprise-grade API key management with encryption, rotation, and
            audit logging
          </p>
        </div>

        {/* Login Form - Centered */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
            Sign In
          </h2>

          {error && (
            <FlashMessage
              type="error"
              message={error}
              onClose={() => setError("")}
            />
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Create account
              </button>
            </p>
          </div>
        </div>

        {/* Features - Centered Below */}
        <div className="text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-slate-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
              <span>Military-grade encryption for all API keys</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-700">
              <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
              <span>Automated key rotation & expiration</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full shrink-0"></div>
              <span>Comprehensive audit logging</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-700">
              <div className="w-2 h-2 bg-amber-500 rounded-full shrink-0"></div>
              <span>Role-based access control</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-12 min-h-screen">
          {/* Left Side - Project Overview */}
          <div className="w-1/2 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <h1 className="text-4xl font-bold text-slate-800">
                Secure Key Manager
              </h1>
            </div>

            <p className="text-lg text-slate-600 mb-8 max-w-md">
              Enterprise-grade API key management with encryption, rotation, and
              audit logging
            </p>

            {/* Feature Highlights */}
            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Military-grade encryption for all API keys</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Automated key rotation & expiration</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Comprehensive audit logging</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Role-based access control</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-1/2 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
                Sign In
              </h2>

              {error && (
                <FlashMessage
                  type="error"
                  message={error}
                  onClose={() => setError("")}
                />
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-600">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Create account
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
