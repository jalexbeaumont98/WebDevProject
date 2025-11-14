import { createContext, useContext, useMemo, useState } from "react";
import * as AuthAPI from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return token ? { token, user: user ? JSON.parse(user) : null } : null;
  });

  const signin = async (email, password) => {
    const data = await AuthAPI.signin(email, password); // 👈 IMPORTANT
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setAuth({ token: data.token, user: data.user });
  };

  const signout = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "GET",
        credentials: "include",
      });
    } catch {}
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