import React, { createContext, useContext } from "react";

// 1. Create Context
const AccessContext = createContext({});

export const AccessProvider = ({ permissions, children }) => {
  console.log("AccessProvider Permissions:", permissions);
  return (
    <AccessContext.Provider value={permissions}>
      {children}
    </AccessContext.Provider>
  );
};

// 3. Hook to access permissions
export const useCanAccess = () => useContext(AccessContext);
