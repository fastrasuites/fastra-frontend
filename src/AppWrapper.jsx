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
import { AccessGroupsProvider } from "./context/AccessGroups/AccessGroupsContext";
import { UserProvider } from "./context/Settings/UserContext";
import { CompanyProvider } from "./context/Settings/CompanyContext";

function AppWrapper() {
  return (
    <TenantProvider>
      <TenantUsersProvider>
        <UserProvider>
          <CompanyProvider>
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
          </CompanyProvider>
        </UserProvider>
      </TenantUsersProvider>
    </TenantProvider>
  );
}

export default AppWrapper;
