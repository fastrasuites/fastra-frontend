import React, { createContext, useContext, useState } from "react";
import { extractPermissions } from "../helper/extractPermissions";
import { AccessProvider } from "./Access/AccessContext";

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const [tenantData, setTenantData] = useState(() => {
    const storedData = localStorage.getItem("tenantData");
    return storedData ? JSON.parse(storedData) : null;
  });

  const [permissions, setPermissions] = useState(() => {
    const stored = localStorage.getItem("permissions");
    return stored ? JSON.parse(stored) : {};
  });

  const login = (data) => {
    localStorage.setItem("tenantData", JSON.stringify(data));
    setTenantData(data);

    if (data.user_accesses) {
      const perms = extractPermissions(data.user_accesses);
      setPermissions(perms);
      localStorage.setItem("permissions", JSON.stringify(perms));
    }
  };


  /**
   * NEW: update specific keys in tenantData while syncing localStorage
   */
  const updateTenantData = (updates) => {
    setTenantData((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("tenantData", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem("tenantData");
    localStorage.removeItem("permissions");
    localStorage.removeItem("onboardingStep");
    localStorage.removeItem("fromStepModals"); 
    setTenantData(null);
    setPermissions({});
  };

  return (
    <TenantContext.Provider value={{ tenantData, permissions, login, logout, updateTenantData }}>
      <AccessProvider permissions={permissions}>{children}</AccessProvider>
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
