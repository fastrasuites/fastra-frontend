import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { TenantProvider } from "./context/TenantContext";

function AppWrapper() {
  return (
    <TenantProvider>
      <Router>
        <App />
      </Router>
    </TenantProvider>
  );
}

export default AppWrapper;
