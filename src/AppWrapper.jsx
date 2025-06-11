import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";

// Context Providers
import { TenantProvider } from "./context/TenantContext";
import { TenantUsersProvider } from "./context/Tanants/TanantUsers";
import { FormProvider } from "./context/FormContext";
import { PurchaseProvider } from "./context/PurchaseContext";
import { RFQProvider } from "./context/RequestForQuotation";
import { LocationConfigProvider } from "./context/Inventory/LocationConfigContext";
import { LocationProvider } from "./context/Inventory/LocationContext";
import { IncomingProductProvider } from "./context/Inventory/IncomingProduct";
import { DeliveryOrderProvider } from "./context/Inventory/DeliveryOrderContext";
import { StockAdjustmentProvider } from "./context/Inventory/StockAdjustment";
import { ScrapProvider } from "./context/Inventory/Scrap";
import { PurchaseOrderProvider } from "./context/PurchaseOrderContext.";
import { StockMoveProvider } from "./context/Inventory/stockMoveContext";

function AppWrapper() {
  return (
    <TenantProvider>
      <TenantUsersProvider>
        <FormProvider>
          <PurchaseProvider>
            <RFQProvider>
              <PurchaseOrderProvider>
                <LocationConfigProvider>
                  <LocationProvider>
                    <IncomingProductProvider>
                      <DeliveryOrderProvider>
                        <StockAdjustmentProvider>
                          <StockMoveProvider>
                            {" "}
                            <ScrapProvider>
                              <Router>
                                <App />
                              </Router>
                            </ScrapProvider>
                          </StockMoveProvider>
                        </StockAdjustmentProvider>
                      </DeliveryOrderProvider>
                    </IncomingProductProvider>
                  </LocationProvider>
                </LocationConfigProvider>
              </PurchaseOrderProvider>
            </RFQProvider>
          </PurchaseProvider>
        </FormProvider>
      </TenantUsersProvider>
    </TenantProvider>
  );
}

export default AppWrapper;
