// TenantContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null); // Holds the tenant ID

  useEffect(() => {
    // Extract tenant from the URL
    const fullUrl = window.location.hostname;
    const parts = fullUrl.split(".");
    const tenantName = parts[0]; // Assuming the first part is the subdomain (tenant name)
    setTenant(tenantName);
  }, [tenant]);

  // Show loading screen until tenant is set
  if (tenant === null) {
    return <p>Loading...</p>;
  }

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
