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
import { StockMoveProvider } from "./context/Inventory/StockMoveContext";
import { AccessGroupsProvider } from "./context/AccessGroups/AccessGroupsContext";
import { UserProvider } from "./context/Settings/UserContext";
import { CompanyProvider } from "./context/Settings/CompanyContext";
import { BackOrderProvider } from "./context/Inventory/BackOrderContext";

function AppWrapper() {
  return (
    <TenantProvider>
      <TenantUsersProvider>
        <FormProvider>
          <AccessGroupsProvider>
            <PurchaseProvider>
              <RFQProvider>
                <PurchaseOrderProvider>
                  <LocationConfigProvider>
                    <LocationProvider>
                      <IncomingProductProvider>
                        <BackOrderProvider>
                          <DeliveryOrderProvider>
                            <StockAdjustmentProvider>
                              <StockMoveProvider>
                                <UserProvider>
                                  <CompanyProvider>
                                    <ScrapProvider>
                                      <Router>
                                        <App />
                                      </Router>
                                    </ScrapProvider>
                                  </CompanyProvider>
                                </UserProvider>
                              </StockMoveProvider>
                            </StockAdjustmentProvider>
                          </DeliveryOrderProvider>
                        </BackOrderProvider>
                      </IncomingProductProvider>
                    </LocationProvider>
                  </LocationConfigProvider>
                </PurchaseOrderProvider>
              </RFQProvider>
            </PurchaseProvider>
          </AccessGroupsProvider>
        </FormProvider>
      </TenantUsersProvider>
    </TenantProvider>
  );
}

export default AppWrapper;
