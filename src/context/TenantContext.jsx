import React, { createContext, useContext, useState } from "react";

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const [tenantData, setTenantData] = useState(() => {
    const storedData = localStorage.getItem("tenantData");
    return storedData ? JSON.parse(storedData) : null;
  });

  const login = (data) => {
    localStorage.setItem("tenantData", JSON.stringify(data));
    setTenantData(data);
  };

  const logout = () => {
    localStorage.removeItem("tenantData");
    setTenantData(null);
  };

  return (
    <TenantContext.Provider value={{ tenantData, login, logout }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
