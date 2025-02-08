import React from "react";
import { useTenant } from "./context/TenantContext";
import { Switch, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Reglog/Register";
import EmailVerification from "./Reglog/EmailVerification";
import Login from "./Reglog/Login";
import ForgetPassword from "./Reglog/ForgetPassword";
import Dashboard from "./dash/Dashboard";
// import GlobalStyle from "./GlobalStyle";
import Contact from "./dash/Contact";
import Settings from "./dash/Settings/Setting";
// import Sethead from "./dash/Settings/Sethead";
import Apk from "./dash/App/Apk";
import User from "./dash/Settings/user/User";
// import Purchead from "./dash/PurchaseModule/Purchead";
import Purchase from "./dash/PurchaseModule/Purchase";
import Newpr from "./dash/PurchaseModule/PurchRequest/Newpr";
import Papr from "./dash/PurchaseModule/PurchRequest/Papr";
import CRfq from "./dash/PurchaseModule/PurchRequest/CRfq";
import Rfq from "../src/dash/PurchaseModule/Rfq/Rfq";
import Rform from "../src/dash/PurchaseModule/Rfq/Rform";
import Rapr from "./dash/PurchaseModule/Rfq/Rapr";
import PurchaseOrder from "../src/dash/PurchaseModule/PurchOrder/PurchaseOrder";
import POrderform from "../src/dash/PurchaseModule/PurchOrder/POrderform";
import Orapr from "./dash/PurchaseModule/PurchOrder/Orapr";
import Vend from "../src/dash/PurchaseModule/Vendor/Vend";
import VendorDetails from "../src/dash/PurchaseModule/Vendor/VendorDetails";
import Newvendor from "./dash/PurchaseModule/Vendor/Newvendor";
import Varcat from "./dash/PurchaseModule/Vendor/vendorcat/Varcat";
import Edit from "./dash/PurchaseModule/Vendor/vendorcat/Edit";
import Prod from "../src/dash/PurchaseModule/Product/Prod";
import ProductDetails from "../src/dash/PurchaseModule/Product/ProductDetails";
import Newprod from "../src/dash/PurchaseModule/Product/Newprod";
import Procat from "./dash/PurchaseModule/Product/Prodcat/Procat";
import Pedit from "./dash/PurchaseModule/Product/Prodcat/Pedit";
import AccessGroups from "./dash/Settings/accessgroups/AccessGroups";
import ConfigurationSettings from "./dash/Configurations/ConfigurationSettings";
import NewCompany from "./dash/Settings/company/NewCompanyForm";
import ResendEmailVerification from "./Reglog/ResendEmailVerification";
import NoHeaderLayout from "./notFound/NoHeaderLayout";
import NotFound from "./notFound/NotFound";
import Inventory from "./dash/Inventory/Inventory";
import Location from "./dash/Inventory/Location/Location";
import LocationForm from "./dash/Inventory/Location/LocationForm";
import LocationConfiguration from "./dash/Inventory/LocationConfiguration/LocationConfig";
import StockAdjustment from "./dash/Inventory/stock/StockAdjustment";
import NewStockAdjustment from "./dash/Inventory/stock/NewStockAdjustment";
import Scrap from "./dash/Inventory/scrap/Scrap";
import NewScrap from "./dash/Inventory/scrap/NewScrap";
import StockMoves from "./dash/Inventory/StockMoves/StockMoves";

function App() {
  // const { tenant_company_name } = useTenant().tenantData;
  return (
    <div className="App" style={{ maxWidth: "1440px", marginInline: "auto" }}>
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
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/contact" component={Contact} />
        <ProtectedRoute path="/settings" component={Settings} />
        <ProtectedRoute path="/apk" component={Apk} />
        <ProtectedRoute path="/company" component={NewCompany} />
        <ProtectedRoute path="/user" component={User} />
        <ProtectedRoute path="/accessgroups" component={AccessGroups} />
        <ProtectedRoute path="/purchase" component={Purchase} />
        <ProtectedRoute path="/npr" component={Newpr} />
        <ProtectedRoute path="/papr" component={Papr} />
        <ProtectedRoute path="/crfq" component={CRfq} />
        <ProtectedRoute path="/rfq" component={Rfq} />
        <ProtectedRoute path="/newrfq" component={Rform} />
        <ProtectedRoute path="/rapr" component={Rapr} />
        <ProtectedRoute path="/purchase-order" component={PurchaseOrder} />
        <ProtectedRoute path="/newPurchaseOrder" component={POrderform} />
        <ProtectedRoute path="/orapr" component={Orapr} />
        <ProtectedRoute path="/vendor" component={Vend} />
        <ProtectedRoute path="/vendetails" component={VendorDetails} />
        <ProtectedRoute path="/Newvendor" component={Newvendor} />
        <ProtectedRoute path="/varcat" component={Varcat} />
        <ProtectedRoute path="/edit" component={Edit} />
        <ProtectedRoute path="/product" component={Prod} />
        <ProtectedRoute path="/prodetails" component={ProductDetails} />
        <ProtectedRoute path="/Newprod" component={Newprod} />
        <ProtectedRoute path="/procat" component={Procat} />
        <ProtectedRoute path="/pedit" component={Pedit} />
        <ProtectedRoute
          path="/purchase-configuration-settings"
          component={ConfigurationSettings}
        />
        <Route path="/inventory" component={Inventory} />
        <ProtectedRoute path="/location" component={Location} />
        <ProtectedRoute
          path="/create-inventory-location"
          component={LocationForm}
        />
        <ProtectedRoute
          path="/location-configuration"
          component={LocationConfiguration}
        />
        <ProtectedRoute path="/stock-adjustment" component={StockAdjustment} />
        <ProtectedRoute
          path="/create-new-stock"
          component={NewStockAdjustment}
        />
        <ProtectedRoute path="/scrap" component={Scrap} />
        <ProtectedRoute path="/new-scrap" component={NewScrap} />
        <ProtectedRoute path="/stock-moves" component={StockMoves} />
        {/* Fallback for 404 */}
        {/* 404 NotFound route with NoHeaderLayout */}
        <Route
          path="*"
          render={() => (
            <NoHeaderLayout>
              <NotFound />
            </NoHeaderLayout>
          )}
        />
      </Switch>
    </div>
  );
}

export default App;
