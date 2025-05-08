// App.js
import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Reglog/Register";
import EmailVerification from "./Reglog/EmailVerification";
import Login from "./Reglog/Login";
import ForgetPassword from "./Reglog/ForgetPassword";
import Dashboard from "./dash/Dashboard";
import Contact from "./dash/Contact";
import Settings from "./dash/Settings/Setting";
import Apk from "./dash/App/Apk";
import User from "./dash/Settings/user/User";
import Purchase from "./dash/PurchaseModule/Purchase";
import Newpr from "./dash/PurchaseModule/PurchRequest/Newpr";
import Papr from "./dash/PurchaseModule/PurchRequest/Papr";
import CRfq from "./dash/PurchaseModule/PurchRequest/CRfq";
import Rfq from "./dash/PurchaseModule/Rfq/Rfq";
import Rform from "./dash/PurchaseModule/Rfq/Rform";
import Rapr from "./dash/PurchaseModule/Rfq/Rapr";
import PurchaseOrder from "./dash/PurchaseModule/PurchOrder/PurchaseOrder";
import POrderform from "./dash/PurchaseModule/PurchOrder/POrderform";
import Orapr from "./dash/PurchaseModule/PurchOrder/POStatusModal";
import Vend from "./dash/PurchaseModule/Vendor/Vend";
import VendorDetails from "./dash/PurchaseModule/Vendor/VendorDetails";
import Newvendor from "./dash/PurchaseModule/Vendor/Newvendor";
import Varcat from "./dash/PurchaseModule/Vendor/vendorcat/Varcat";
import Edit from "./dash/PurchaseModule/Vendor/vendorcat/Edit";
import Prod from "./dash/PurchaseModule/Product/Prod";
import ProductDetails from "./dash/PurchaseModule/Product/ProductDetails";
import Newprod from "./dash/PurchaseModule/Product/Newprod";
import Procat from "./dash/PurchaseModule/Product/Prodcat/Procat";
import Pedit from "./dash/PurchaseModule/Product/Prodcat/Pedit";
import AccessGroups from "./dash/Settings/accessgroups/AccessGroups";
import ConfigurationSettings from "./dash/Configurations/ConfigurationSettings";
import ResendEmailVerification from "./Reglog/ResendEmailVerification";
import NoHeaderLayout from "./notFound/NoHeaderLayout";
import NotFound from "./notFound/NotFound";
import POFormWrapper from "./dash/PurchaseModule/PurchOrder/POForm/POFormWrapper";
import RFQFormWrapper from "./dash/PurchaseModule/Rfq/RfqForm/RFQFormWrapper";
import InventoryLayout from "./dash/Inventory/Inventory";
import PurchaseLayout from "./dash/PurchaseModule/Purchase";

function App() {
  return (
    <div className="App" style={{ width: "100vw", minHeight: "100vh" }}>
      <Router>
        <Switch>
          {/* Global (non-tenant-specific) routes */}
          <Route exact path="/" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/forget-password" component={ForgetPassword} />
          <Route path="/verify-email" component={EmailVerification} />
          <Route
            path="/resend-email-verification"
            component={ResendEmailVerification}
          />

          {/* Tenant-aware routes */}
          <Route path="/:tenant">
            <Switch>
              <ProtectedRoute
                exact
                path="/:tenant/dashboard"
                component={Dashboard}
              />
              <ProtectedRoute
                exact
                path="/:tenant/contact"
                component={Contact}
              />
              <ProtectedRoute
                exact
                path="/:tenant/settings"
                component={Settings}
              />
              <ProtectedRoute exact path="/:tenant/apk" component={Apk} />
              <ProtectedRoute exact path="/:tenant/user" component={User} />
              <ProtectedRoute
                exact
                path="/:tenant/accessgroups"
                component={AccessGroups}
              />
              <ProtectedRoute exact path="/:tenant/npr" component={Newpr} />
              <ProtectedRoute exact path="/:tenant/papr" component={Papr} />
              <ProtectedRoute exact path="/:tenant/crfq" component={CRfq} />
              <ProtectedRoute
                exact
                path="/:tenant/rfq/convert"
                component={RFQFormWrapper}
              />
              <ProtectedRoute exact path="/:tenant/rfq" component={Rfq} />
              <ProtectedRoute exact path="/:tenant/newrfq" component={Rform} />
              <ProtectedRoute exact path="/:tenant/rapr" component={Rapr} />
              <ProtectedRoute
                exact
                path="/:tenant/purchase-order/convert"
                component={POFormWrapper}
              />
              <ProtectedRoute
                exact
                path="/:tenant/purchase-order"
                component={PurchaseOrder}
              />
     
    
              <ProtectedRoute exact path="/:tenant/vendor" component={Vend} />
              <ProtectedRoute
                exact
                path="/:tenant/vendetails"
                component={VendorDetails}
              />
              <ProtectedRoute
                exact
                path="/:tenant/Newvendor"
                component={Newvendor}
              />
              <ProtectedRoute
                exact
                path="/:tenant/purchase-configuration-settings"
                component={ConfigurationSettings}
              />
              <ProtectedRoute exact path="/:tenant/varcat" component={Varcat} />
              <ProtectedRoute exact path="/:tenant/edit" component={Edit} />
              <ProtectedRoute exact path="/:tenant/product" component={Prod} />
              <ProtectedRoute
                exact
                path="/:tenant/prodetails"
                component={ProductDetails}
              />
              <ProtectedRoute
                exact
                path="/:tenant/Newprod"
                component={Newprod}
              />
              <ProtectedRoute exact path="/:tenant/procat" component={Procat} />
              <ProtectedRoute exact path="/:tenant/pedit" component={Pedit} />

              {/* Purchase Route - allows nested routes */}
              <ProtectedRoute
                path="/:tenant/purchase"
                component={PurchaseLayout}
              />

              {/* Inventory Route - allows nested routes */}
              <ProtectedRoute
                path="/:tenant/inventory"
                component={InventoryLayout}
              />

              {/* Additional tenant routes can be defined here */}

              {/* Fallback for 404 */}
              <Route
                path="*"
                render={() => (
                  <NoHeaderLayout>
                    <NotFound />
                  </NoHeaderLayout>
                )}
              />
            </Switch>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
