import { createContext, useContext, useState, useEffect } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
const [loading, setLoading] = useState(true); // "manager" | "member" | null

useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("crave_token");
      if (!token) { setLoading(false); return; }
      try {
        const data = await api.me();
        setRole(data.role);
      } catch {
        localStorage.removeItem("crave_token");
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email, password) {
  const data = await api.login(email, password);
  localStorage.setItem("crave_token", data.token);
  setRole(data.user.role);
}

async function logout() {
  await api.logout();
  localStorage.removeItem("crave_token");
  setRole(null);
}

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }