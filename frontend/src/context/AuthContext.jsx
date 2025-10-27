// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Tracks auth state

  // Load user on initial render
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/test-user/me");
          setUser(res.data.user);
          localStorage.setItem("role", res.data.user.role); // ✅ ensure role exists
        } catch (err) {
          console.error("Token validation failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.user.role); // ✅ store role
    setUser(res.data.user);
  };

  const register = async (name, email, password, role) => {
    // add role if needed
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.user.role); // ✅ store role
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
