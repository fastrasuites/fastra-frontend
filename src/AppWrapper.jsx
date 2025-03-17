import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { TenantProvider } from "./context/TenantContext";
import { PurchaseProvider } from "./context/PurchaseContext";
import { RFQProvider } from "./context/RequestForQuotation";

function AppWrapper() {
  return (
    <TenantProvider>
      <PurchaseProvider>
        <RFQProvider>
          <Router>
            <App />
          </Router>
        </RFQProvider>
      </PurchaseProvider>
    </TenantProvider>
  );
}

export default AppWrapper;
