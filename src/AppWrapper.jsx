import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { TenantProvider } from "./context/TenantContext";
import { PurchaseProvider } from "./context/PurchaseContext";
import { RFQProvider } from "./context/RequestForQuotation";
import { PurchaseOrderProvider } from "./context/PurchaseOrderContext.";

function AppWrapper() {
  return (
    <TenantProvider>
      <PurchaseProvider>
        <RFQProvider>
          <PurchaseOrderProvider>
            <Router>
              <App />
            </Router>
          </PurchaseOrderProvider>
        </RFQProvider>
      </PurchaseProvider>
    </TenantProvider>
  );
}

export default AppWrapper;
