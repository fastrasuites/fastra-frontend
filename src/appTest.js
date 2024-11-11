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
import NoHeaderLayout from "./notFound/NoHeaderLayout";
import NotFound from "./notFound/NotFound";

function App() {
  const location = useLocation();
  const { tenant } = useTenant(); // Get tenant from context
  const MAIN_DOMAIN = "fastra-frontend.vercel.app";

  // Step 1: Utility function to generate tenant-specific URL
  const getTenantUrl = (tenant, path = "") => {
    return tenant
      ? `https://${tenant}.${MAIN_DOMAIN}${path}`
      : `https://${MAIN_DOMAIN}${path}`;
  };

  // Step 2: Redirect function to navigate to tenant-specific URLs
  const redirectToTenantRoute = (tenant, path) => {
    const tenantUrl = getTenantUrl(tenant, path);
    window.location.href = tenantUrl; // Redirects to tenant-specific URL
  };

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
    "/notfound",
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
    "/notfound",
  ];
  return (
    <div className="App" style={{ maxWidth: "1440px", marginInline: "auto" }}>
      {!noHeaderRoutes.includes(location.pathname) &&
        location.pathname !== "/notfound" && <Purchead />}
      {!noHeadRoutes.includes(location.pathname) &&
        location.pathname !== "/notfound" && <Sethead />}
      <GlobalStyle />
      <Switch>
        <Route exact path="/" component={Register} />
        <Route path="/verify-email" component={EmailVerification} />

        <Route
          path={
            tenant
              ? getTenantUrl(tenant, "/resend-email-verification")
              : "/resend-email-verification"
          }
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/resend-email-verification");
              return null;
            }
            return <ResendEmailVerification />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/forgpas") : "/forgpas"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/forgpas");
              return null;
            }
            return <ForgetPassword />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/login") : "/login"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/login");
              return null;
            }
            return <Login />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/dashboard") : "/dashboard"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/dashboard");
              return null;
            }
            return <Dashboard />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/contact") : "/contact"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/contact");
              return null;
            }
            return <Contact />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/settings") : "/settings"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/settings");
              return null;
            }
            return <Settings />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/apk") : "/apk"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/apk");
              return null;
            }
            return <Apk />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/company") : "/company"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/company");
              return null;
            }
            return <NewCompany />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/user") : "/user"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/user");
              return null;
            }
            return <User />;
          }}
        />
        <Route
          path={
            tenant ? getTenantUrl(tenant, "/accessgroups") : "/accessgroups"
          }
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/accessgroups");
              return null;
            }
            return <AccessGroups />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/purchase") : "/purchase"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/purchase");
              return null;
            }
            return <Purchase />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/npr") : "/npr"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/npr");
              return null;
            }
            return <Newpr />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/papr") : "/papr"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/papr");
              return null;
            }
            return <Papr />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/crfq") : "/crfq"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/crfq");
              return null;
            }
            return <CRfq />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/rfq") : "/rfq"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/rfq");
              return null;
            }
            return <Rfq />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/newrfq") : "/newrfq"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/newrfq");
              return null;
            }
            return <Rform />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/rapr") : "/rapr"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/rapr");
              return null;
            }
            return <Rapr />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/pod") : "/pod"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/pod");
              return null;
            }
            return <PurchaseOrder />;
          }}
        />
        <Route
          path={
            tenant
              ? getTenantUrl(tenant, "/newPurchaseOrder")
              : "/newPurchaseOrder"
          }
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/newPurchaseOrder");
              return null;
            }
            return <POrderform />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/orapr") : "/orapr"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/orapr");
              return null;
            }
            return <Orapr />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/vend") : "/vend"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/vend");
              return null;
            }
            return <Vend />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/vendetails") : "/vendetails"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/vendetails");
              return null;
            }
            return <VendorDetails />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/Newvendor") : "/Newvendor"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/Newvendor");
              return null;
            }
            return <Newvendor />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/varcat") : "/varcat"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/varcat");
              return null;
            }
            return <Varcat />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/edit") : "/edit"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/edit");
              return null;
            }
            return <Edit />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/prod") : "/prod"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/prod");
              return null;
            }
            return <Prod />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/prodetails") : "/prodetails"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/prodetails");
              return null;
            }
            return <ProductDetails />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/Newprod") : "/Newprod"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/Newprod");
              return null;
            }
            return <Newprod />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/procat") : "/procat"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/procat");
              return null;
            }
            return <Procat />;
          }}
        />
        <Route
          path={tenant ? getTenantUrl(tenant, "/pedit") : "/pedit"}
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/pedit");
              return null;
            }
            return <Pedit />;
          }}
        />
        <Route
          path={
            tenant ? getTenantUrl(tenant, "/configurations") : "/configurations"
          }
          render={() => {
            if (tenant) {
              redirectToTenantRoute(tenant, "/configurations");
              return null;
            }
            return <ConfigurationSettings />;
          }}
        />
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