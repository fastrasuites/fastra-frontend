import React from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import Register from "./Reglog/Register";
import EmailVerification from "./Reglog/EmailVerification";
import Login from "./Reglog/Login";
import ForgetPassword from "./Reglog/ForgetPassword";
import Dashboard from "./dash/Dashboard";
import GlobalStyle from "./GlobalStyle";
import Contact from "./dash/Contact";
import Settings from "./dash/Settings/Setting";
import Sethead from "./dash/Settings/Sethead";
import Apk from "./dash/App/Apk";
import User from "./dash/Settings/user/User";
import Purchead from "./dash/PurchaseModule/Purchead";
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
import { useTenant } from "./context/TenantContext";

function App() {
  const location = useLocation();
  const { tenant } = useTenant(); // Get tenant from context

  // Utility function for tenant-specific routes
  const tenantRoute = (route) => (tenant ? `/${tenant}${route}` : route);

  const noHeaderRoutes = [
    "/",
    "/login",
    "/dashboard",
    "/fogpas",
    "/contact",
    "/settings",
    "/company",
    "/apk",
    "/user",
    "/accessgroups",
    "/verify-email",
    "/resend-email-verification",
  ];
  const noHeadRoutes = [
    "/",
    "/login",
    "/dashboard",
    "/fogpas",
    "/contact",
    "/purchase",
    "/npr",
    "/papr",
    "/crfq",
    "/rfq",
    "/newrfq",
    "/rapr",
    "/pod",
    "/newPurchaseOrder",
    "/orapr",
    "/vend",
    "/vendetails",
    "/Newvendor",
    "/varcat",
    "/edit",
    "/prod",
    "/prodetails",
    "/Newprod",
    "/procat",
    "/pedit",
    "/verify-email",
    "/resend-email-verification",
  ];
  return (
    <div className="App" style={{ maxWidth: "1440px", marginInline: "auto" }}>
      {!noHeaderRoutes.includes(location.pathname) && <Purchead />}
      {!noHeadRoutes.includes(location.pathname) && <Sethead />}
      <GlobalStyle />
      <Switch>
        <Route exact path="/" component={Register} />
        <Route path="/verify-email" component={EmailVerification} />
        <Route
          path={tenantRoute("/resend-email-verification")}
          component={ResendEmailVerification}
        />
        <Route path={tenantRoute("/login")} component={Login} />
        <Route
          path={tenantRoute("/forgot-password")}
          component={ForgetPassword}
        />
        <Route path={tenantRoute("/dashboard")} component={Dashboard} />
        <Route path={tenantRoute("/contact")} component={Contact} />
        <Route path={tenantRoute("/settings")} component={Settings} />
        <Route path={tenantRoute("/apk")} component={Apk} />
        <Route path={tenantRoute("/company")} component={NewCompany} />
        <Route path={tenantRoute("/user")} component={User} />
        <Route path={tenantRoute("/accessgroups")} component={AccessGroups} />
        <Route path={tenantRoute("/purchase")} component={Purchase} />
        <Route path={tenantRoute("/npr")} component={Newpr} />
        <Route path={tenantRoute("/papr")} component={Papr} />
        <Route path={tenantRoute("/crfq")} component={CRfq} />
        <Route path={tenantRoute("/rfq")} component={Rfq} />
        <Route path={tenantRoute("/newrfq")} component={Rform} />
        <Route path={tenantRoute("/rapr")} component={Rapr} />
        <Route path={tenantRoute("/pod")} component={PurchaseOrder} />
        <Route path={tenantRoute("/newPurchaseOrder")} component={POrderform} />
        <Route path={tenantRoute("/orapr")} component={Orapr} />
        <Route path={tenantRoute("/vend")} component={Vend} />
        <Route path={tenantRoute("/vendetails")} component={VendorDetails} />
        <Route path={tenantRoute("/Newvendor")} component={Newvendor} />
        <Route path={tenantRoute("/varcat")} component={Varcat} />
        <Route path={tenantRoute("/edit")} component={Edit} />
        <Route path={tenantRoute("/prod")} component={Prod} />
        <Route path={tenantRoute("/prodetails")} component={ProductDetails} />
        <Route path={tenantRoute("/Newprod")} component={Newprod} />
        <Route path={tenantRoute("/procat")} component={Procat} />
        <Route path={tenantRoute("/pedit")} component={Pedit} />
        <Route
          path={tenantRoute("/configurations")}
          component={ConfigurationSettings}
        />
      </Switch>
    </div>
  );
}


export default App;
