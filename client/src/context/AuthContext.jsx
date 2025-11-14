import { createContext, useContext, useMemo, useState } from "react";
import * as AuthAPI from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return token ? { token, user: JSON.parse(user) } : null;
  });

  const signin = async (email, password) => {
    const data = await AuthAPI.signin(email, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setAuth({ token: data.token, user: data.user });
    return data;
  };

  const signup = async (displayName, email, password) => {
    return await AuthAPI.signup(displayName, email, password);
  };

  const signout = async () => {
    await AuthAPI.signout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(null);
  };

  const value = useMemo(
    () => ({ auth, signin, signout, signup }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}