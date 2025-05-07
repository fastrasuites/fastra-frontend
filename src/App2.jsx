// App.js
import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useTenant } from "./context/TenantContext";
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

function App2() {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  if (!tenant_schema_name) {
    // You might want to return a loading spinner or null here
    console.log("Tenant schema name is not available.");
    return <div>Loading...</div>;
  }

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
          <ProtectedRoute
            path={`/${tenant_schema_name}/dashboard`}
            component={Dashboard}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/contact`}
            component={Contact}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/settings`}
            component={Settings}
          />
          <ProtectedRoute path={`/${tenant_schema_name}/apk`} component={Apk} />
          <ProtectedRoute
            path={`/${tenant_schema_name}/user`}
            component={User}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/accessgroups`}
            component={AccessGroups}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/purchase`}
            component={Purchase}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/npr`}
            component={Newpr}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/papr`}
            component={Papr}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/crfq`}
            component={CRfq}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/rfq/convert`}
            component={RFQFormWrapper}
          />
          <ProtectedRoute path={`/${tenant_schema_name}/rfq`} component={Rfq} />
          <ProtectedRoute
            path={`/${tenant_schema_name}/newrfq`}
            component={Rform}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/rapr`}
            component={Rapr}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/purchase-order/convert`}
            component={POFormWrapper}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/purchase-order`}
            component={PurchaseOrder}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/newPurchaseOrder`}
            component={POrderform}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/orapr`}
            component={Orapr}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/vendor`}
            component={Vend}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/vendetails`}
            component={VendorDetails}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/Newvendor`}
            component={Newvendor}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/purchase-configuration-settings`}
            component={ConfigurationSettings}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/varcat`}
            component={Varcat}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/edit`}
            component={Edit}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/product`}
            component={Prod}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/prodetails`}
            component={ProductDetails}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/Newprod`}
            component={Newprod}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/procat`}
            component={Procat}
          />
          <ProtectedRoute
            path={`/${tenant_schema_name}/pedit`}
            component={Pedit}
          />

          {/* Inventory Routes: All inventory URLs now use InventoryLayout */}
          <ProtectedRoute
            path={`/${tenant_schema_name}/inventory`}
            component={() => <InventoryLayout />}
            exact={false} // Allow nested routes to match
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
      </Router>
    </div>
  );
}

export default App2;
