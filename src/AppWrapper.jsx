import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { TenantProvider } from "./context/TenantContext";
import { PurchaseProvider } from "./context/PurchaseContext";

function AppWrapper() {
  return (
    <TenantProvider>
      <PurchaseProvider>
        <Router>
          <App />
        </Router>
      </PurchaseProvider>
    </TenantProvider>
  );
}

export default AppWrapper;
