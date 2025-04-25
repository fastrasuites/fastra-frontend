import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { TenantProvider } from "./context/TenantContext";
import { PurchaseProvider } from "./context/PurchaseContext";
import { RFQProvider } from "./context/RequestForQuotation";
import { PurchaseOrderProvider } from "./context/PurchaseOrderContext.";
import { FormProvider } from "./context/FormContext";
import { TenantUsersProvider } from "./context/Tanants/TanantUsers";
import { LocationProvider } from "./context/Inventory/LocationContext";
import { LocationConfigProvider } from "./context/Inventory/LocationConfigContext";
import { StockAdjustmentProvider } from "./context/Inventory/StockAdjustment";

function AppWrapper() {
  return (
    <TenantProvider>
      <TenantUsersProvider>
        <FormProvider>
          <PurchaseProvider>
            <LocationConfigProvider>
            <RFQProvider>
              <PurchaseOrderProvider>
                <LocationProvider>
                  <StockAdjustmentProvider>
                  <Router>
                    <App />
                  </Router>
                  </StockAdjustmentProvider>
                </LocationProvider>
              </PurchaseOrderProvider>
            </RFQProvider>
            </LocationConfigProvider>
          </PurchaseProvider>
        </FormProvider>
      </TenantUsersProvider>
    </TenantProvider>
  );
}

export default AppWrapper;
