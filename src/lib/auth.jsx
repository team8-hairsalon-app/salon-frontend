import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "./authApi";

// ---------------- Helpers ----------------
function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

function isExpired(token) {
  const { exp } = decodeJwt(token || "");
  return !exp ? true : Date.now() >= exp * 1000;
}

export function isTokenValid() {
  const t = localStorage.getItem("access_token") || "";
  return !!t && !isExpired(t);
}

export function currentUserFromToken() {
  const t = localStorage.getItem("access_token") || "";
  if (!t || isExpired(t)) return null;
  const c = decodeJwt(t);
  const first = (c?.name || "").split(" ")[0] || "";
  return { email: c?.email || "", name: c?.name || "", firstName: first };
}

// ---------------- Context ----------------
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [access, setAccess] = useState(() => localStorage.getItem("access_token") || "");
  const [refresh, setRefresh] = useState(() => localStorage.getItem("refresh_token") || "");
  const [user, setUser] = useState(() => currentUserFromToken());

  // Keep localStorage synced
  useEffect(() => {
    if (access) localStorage.setItem("access_token", access);
    else localStorage.removeItem("access_token");

    if (refresh) localStorage.setItem("refresh_token", refresh);
    else localStorage.removeItem("refresh_token");
  }, [access, refresh]);

  // Evict expired token on mount
  useEffect(() => {
    if (access && isExpired(access)) {
      setAccess("");
      setRefresh("");
      setUser(null);
    }
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = () => {
      const a = localStorage.getItem("access_token") || "";
      const r = localStorage.getItem("refresh_token") || "";
      if (!a || isExpired(a)) {
        setAccess("");
        setRefresh("");
        setUser(null);
      } else {
        setAccess(a);
        setRefresh(r);
        setUser(currentUserFromToken());
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-updated", onStorage);
    };
  }, []);

  // Auth API
  const value = useMemo(
    () => ({
      isAuthed: !!access && !!user,
      user,
      async login({ email, password }) {
        const data = await authApi.login({ email, password });
        const a = data?.access || "";
        const r = data?.refresh || "";
        if (!a) throw new Error("No access token");
        setAccess(a);
        setRefresh(r);

        const u = currentUserFromToken();
        setUser(u);

        // Cache friendly fields for UI
        if (u?.firstName) localStorage.setItem("user_first_name", u.firstName);
        if (u?.email) localStorage.setItem("user_email", u.email);

        window.dispatchEvent(new Event("auth-updated"));
        return data;
      },
      async register(payload) {
        return authApi.register(payload);
      },
      async logout() {
        setAccess("");
        setRefresh("");
        setUser(null);
        await authApi.logout();

        // clear cached user fields 
        localStorage.removeItem("user_first_name");
        localStorage.removeItem("user_email");

        window.dispatchEvent(new Event("auth-updated"));
      },
    }),
    [access, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
