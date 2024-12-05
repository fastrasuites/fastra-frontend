// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { login, refreshAccessToken } from "../api/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const tenantName = window.location.hostname.split(".")[0];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const loginUser = async (email, password) => {
    try {
      const data = await login(tenantName, email, password);
      setAccessToken(data.access_token);
      localStorage.setItem("access_token", data.access_token);
      setUser(data.user);
      console.log("Access Token:", accessToken, "User:", user);
    } catch (error) {
      if (error.response?.status === 404) {
        console.error("Tenant not found");
        // Handle tenant error (e.g., show a tenant-specific error page)
      } else {
        console.error("Login failed:", error);
      }
    }
  };

  const logoutUser = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    console.log("User logged out successfully");
  };

  const refreshUserToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const newAccessToken = await refreshAccessToken(tenantName, refreshToken);
      setAccessToken(newAccessToken);
      localStorage.setItem("access_token", newAccessToken);
    } catch (error) {
      console.error("Token refresh failed:", error);
      logoutUser();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loginUser, logoutUser, refreshUserToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
