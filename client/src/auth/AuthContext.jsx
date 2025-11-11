import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const user  = localStorage.getItem("user");
    return token ? { token, user: user ? JSON.parse(user) : null } : null;
  });

  const signin = async (email, password) => {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // grabs cookie "t" if you’re using it
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Sign-in failed");
    }

    const data = await res.json(); // { token, user }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setAuth({ token: data.token, user: data.user });
  };

  const signout = async () => {
    // call API to clear cookie (optional if you only store token client-side)
    await fetch("/api/auth/signout", { method: "GET", credentials: "include" }).catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(null);
  };

  const value = useMemo(() => ({ auth, signin, signout }), [auth]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}