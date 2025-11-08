// src/auth/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ADMIN_SEED = {
  id: "seed-admin",
  username: "admin",
  name: "Administrator",
  password: "admin123",
  role: "admin",
};

export const ADMIN_INVITE_CODE = "STH-ADMIN-2025";

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [intendedPage, setIntendedPage] = useState(null);

  useEffect(() => {
    let savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    savedUsers = savedUsers.map((u) => ({
      ...u,
      username: u.username || (u.email ? u.email.split("@")[0] : undefined),
      name: u.name || u.username || "User",
    }));
    if (!savedUsers.some((u) => u.role === "admin")) savedUsers.push(ADMIN_SEED);

    setUsers(savedUsers);
    localStorage.setItem("users", JSON.stringify(savedUsers));

    const savedSession = JSON.parse(localStorage.getItem("auth_user") || "null");
    if (savedSession) setCurrentUser(savedSession);
  }, []);

  const persistUsers = (list) => {
    setUsers(list);
    localStorage.setItem("users", JSON.stringify(list));
  };

  const login = (username, password) => {
    const found = users.find(
      (u) =>
        u.username &&
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );
    if (!found) throw new Error("Sai username hoặc mật khẩu.");
    setCurrentUser(found);
    localStorage.setItem("auth_user", JSON.stringify(found));
    return found;
  };

  const register = ({ username, password, name, inviteCode }) => {
    if (!username?.trim() || !password?.trim())
      throw new Error("Vui lòng nhập username và mật khẩu.");

    if (users.some((u) => u.username?.toLowerCase() === username.toLowerCase()))
      throw new Error("Username đã tồn tại.");

    const role =
      inviteCode && inviteCode === ADMIN_INVITE_CODE ? "admin" : "user";

    const newUser = {
      id: Date.now().toString(36),
      username: username.trim(),
      name: (name?.trim() || username.trim()),
      password: password.trim(),
      role,
    };
    const list = [...users, newUser];
    persistUsers(list);
    setCurrentUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("auth_user");
  };

  const value = {
    users,
    currentUser,
    intendedPage,
    setIntendedPage,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
