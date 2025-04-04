import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { TenantProvider } from "./context/TenantContext";
import { PurchaseProvider } from "./context/PurchaseContext";
import { RFQProvider } from "./context/RequestForQuotation";
import { PurchaseOrderProvider } from "./context/PurchaseOrderContext.";
import { FormProvider } from "./context/FormContext";

function AppWrapper() {
  return (
    <TenantProvider>
      <FormProvider>
        <PurchaseProvider>
          <RFQProvider>
            <PurchaseOrderProvider>
              <Router>
                <App />
              </Router>
            </PurchaseOrderProvider>
          </RFQProvider>
        </PurchaseProvider>
      </FormProvider>
    </TenantProvider>
  );
}

export default AppWrapper;
