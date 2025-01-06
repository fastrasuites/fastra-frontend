// App.js
import React, { useState, useEffect } from "react";
import { Switch, Route, useHistory } from "react-router-dom";
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
import { useTenant } from "./context/TenantContext";
import NoHeaderLayout from "./notFound/NoHeaderLayout";
import NotFound from "./notFound/NotFound";
// import { components } from "react-select";
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
  // const location = useLocation();
  const { tenant } = useTenant(); // Get tenant from context
  console.log(tenant);

  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    if (tenant !== null) {
      setLoading(false); // Tenant value is set, stop loadin
    }
  }, [tenant]);

  if (loading) {
    return <p>Loading...</p>; // Show loading while tenant is being se
  }

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
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/contact" component={Contact} />
        <Route path="/settings" component={Settings} />
        <Route path="/apk" component={Apk} />
        <Route path="/company" component={NewCompany} />
        <Route path="/user" component={User} />
        <Route path="/accessgroups" component={AccessGroups} />
        <Route path="/purchase" component={Purchase} />
        <Route path="/npr" component={Newpr} />
        <Route path="/papr" component={Papr} />
        <Route path="/crfq" component={CRfq} />
        <Route path="/rfq" component={Rfq} />
        <Route path="/newrfq" component={Rform} />
        <Route path="/rapr" component={Rapr} />
        <Route path="/purchase-order" component={PurchaseOrder} />
        <Route path="/newPurchaseOrder" component={POrderform} />
        <Route path="/orapr" component={Orapr} />
        <Route path="/vendor" component={Vend} />
        <Route path="/vendetails" component={VendorDetails} />
        <Route path="/Newvendor" component={Newvendor} />
        <Route path="/varcat" component={Varcat} />
        <Route path="/edit" component={Edit} />
        <Route path="/product" component={Prod} />
        <Route path="/prodetails" component={ProductDetails} />
        <Route path="/Newprod" component={Newprod} />
        <Route path="/procat" component={Procat} />
        <Route path="/pedit" component={Pedit} />
        <Route
          path="/purchase-configuration-settings"
          component={ConfigurationSettings}
        />
        <Route path="/inventory" component={Inventory} />
        <Route path="/location" component={Location} />
        <Route path="/create-inventory-location" component={LocationForm} />
        <Route
          path="/location-configuration"
          component={LocationConfiguration}
        />
        <Route path="/stock-adjustment" component={StockAdjustment} />
        <Route path="/create-new-stock" component={NewStockAdjustment} />
        <Route path="/scrap" component={Scrap} />
        <Route path="/new-scrap" component={NewScrap} />
        <Route path="/stock-moves" component={StockMoves} />

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

// ------------------------------------------------------------------
// // App.js
// import React, {useState, useEffect} from "react";
// import { Switch, Route } from "react-router-dom";
// import Register from "./Reglog/Register";
// import EmailVerification from "./Reglog/EmailVerification";
// import Login from "./Reglog/Login";
// import ForgetPassword from "./Reglog/ForgetPassword";
// import Dashboard from "./dash/Dashboard";
// // import GlobalStyle from "./GlobalStyle";
// import Contact from "./dash/Contact";
// import Settings from "./dash/Settings/Setting";
// // import Sethead from "./dash/Settings/Sethead";
// import Apk from "./dash/App/Apk";
// import User from "./dash/Settings/user/User";
// // import Purchead from "./dash/PurchaseModule/Purchead";
// import Purchase from "./dash/PurchaseModule/Purchase";
// import Newpr from "./dash/PurchaseModule/PurchRequest/Newpr";
// import Papr from "./dash/PurchaseModule/PurchRequest/Papr";
// import CRfq from "./dash/PurchaseModule/PurchRequest/CRfq";
// import Rfq from "../src/dash/PurchaseModule/Rfq/Rfq";
// import Rform from "../src/dash/PurchaseModule/Rfq/Rform";
// import Rapr from "./dash/PurchaseModule/Rfq/Rapr";
// import PurchaseOrder from "../src/dash/PurchaseModule/PurchOrder/PurchaseOrder";
// import POrderform from "../src/dash/PurchaseModule/PurchOrder/POrderform";
// import Orapr from "./dash/PurchaseModule/PurchOrder/Orapr";
// import Vend from "../src/dash/PurchaseModule/Vendor/Vend";
// import VendorDetails from "../src/dash/PurchaseModule/Vendor/VendorDetails";
// import Newvendor from "./dash/PurchaseModule/Vendor/Newvendor";
// import Varcat from "./dash/PurchaseModule/Vendor/vendorcat/Varcat";
// import Edit from "./dash/PurchaseModule/Vendor/vendorcat/Edit";
// import Prod from "../src/dash/PurchaseModule/Product/Prod";
// import ProductDetails from "../src/dash/PurchaseModule/Product/ProductDetails";
// import Newprod from "../src/dash/PurchaseModule/Product/Newprod";
// import Procat from "./dash/PurchaseModule/Product/Prodcat/Procat";
// import Pedit from "./dash/PurchaseModule/Product/Prodcat/Pedit";
// import AccessGroups from "./dash/Settings/accessgroups/AccessGroups";
// import ConfigurationSettings from "./dash/Configurations/ConfigurationSettings";
// import NewCompany from "./dash/Settings/company/NewCompanyForm";
// import ResendEmailVerification from "./Reglog/ResendEmailVerification";
// import { useTenant } from "./context/TenantContext";
// import NoHeaderLayout from "./notFound/NoHeaderLayout";
// import NotFound from "./notFound/NotFound";
// // import { components } from "react-select";
// import Inventory from "./dash/Inventory/Inventory";
// import Location from "./dash/Inventory/Location/Location";
// import LocationForm from "./dash/Inventory/Location/LocationForm";
// import LocationConfiguration from "./dash/Inventory/LocationConfiguration/LocationConfig";
// import StockAdjustment from "./dash/Inventory/stock/StockAdjustment";
// import NewStockAdjustment from "./dash/Inventory/stock/NewStockAdjustment";
// import Scrap from "./dash/Inventory/scrap/Scrap";
// import NewScrap from "./dash/Inventory/scrap/NewScrap";
// import StockMoves from "./dash/Inventory/StockMoves/StockMoves";

// function App() {
//   // const location = useLocation();
//   const { tenant } = useTenant(); // Get tenant from context
//   console.log(tenant);

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (tenant !== null) {
//       setLoading(false); // Tenant value is set, stop loadin
//     }
//   }, [tenant]);

//   // checks url for localhost:3000 or fastrasuite.com
//   const MAIN_DOMAIN = window.location.href.includes("fastrasuite.com")
//     ? "fastrasuite.com"
//     : "localhost:3000";

//   // Determine protocol dynamically (http for localhost, https for production)
//   const PROTOCOL = window.location.protocol.includes("https") ? "https" : "http"

//   // Utility function to generate tenant-specific URL
//   const getTenantUrl = (tenant, path = "") => {
//     return tenant
//       ? `${PROTOCOL}://${tenant}.${MAIN_DOMAIN}${path}`
//       : `${PROTOCOL}://${MAIN_DOMAIN}${path}`;
//   };

//   // Redirect function to navigate to tenant-specific URLs
//   const redirectToTenantRoute = (tenant, path) => {
//     const tenantUrl = getTenantUrl(tenant, path);
//     window.location.href = tenantUrl;
//   };

//   if (loading) {
//     return <p>Loading...</p>; // Show loading while tenant is being se
//   }

//   return (
//     <div className="App" style={{ maxWidth: "1440px", marginInline: "auto" }}>

//       <Switch>
//         {/* Global (non-tenant-specific) routes */}
//         <Route exact path="/" component={Register} />
//         <Route path="/login" component={Login} />
//         <Route path="/forget-password" component={ForgetPassword} />
//         <Route path="/verify-email" component={EmailVerification} />
//         <Route path="/resend-email-verification" component={ResendEmailVerification} />
//         {/* <Route path="/dashboard" component={Dashboard} /> */}

//         {/* Define tenant-aware routes */}
//         {[
//           { path: "/dashboard", component: Dashboard },
//           { path: "/contact", component: Contact },
//           { path: "/settings", component: Settings },
//           { path: "/apk", component: Apk },
//           { path: "/company", component: NewCompany },
//           { path: "/user", component: User },
//           { path: "/accessgroups", component: AccessGroups },
//           { path: "/purchase", component: Purchase },
//           { path: "/npr", component: Newpr },
//           { path: "/papr", component: Papr },
//           { path: "/crfq", component: CRfq },
//           { path: "/rfq", component: Rfq },
//           { path: "/newrfq", component: Rform },
//           { path: "/rapr", component: Rapr },
//           { path: "/purchase-order", component: PurchaseOrder },
//           { path: "/newPurchaseOrder", component: POrderform },
//           { path: "/orapr", component: Orapr },
//           { path: "/vendor", component: Vend },
//           { path: "/vendetails", component: VendorDetails },
//           { path: "/Newvendor", component: Newvendor },
//           { path: "/varcat", component: Varcat },
//           { path: "/edit", component: Edit },
//           { path: "/product", component: Prod },
//           { path: "/prodetails", component: ProductDetails },
//           { path: "/Newprod", component: Newprod },
//           { path: "/procat", component: Procat },
//           { path: "/pedit", component: Pedit },
//           {
//             path: "/purchase-configuration-settings",
//             component: ConfigurationSettings,
//           },
//           { path: "/inventory", component: Inventory },
//           { path: "/location", component: Location },
//           { path: "/create-inventory-location", component: LocationForm },
//           { path: "/location-configuration", component: LocationConfiguration },
//           { path: "/stock-adjustment", component: StockAdjustment },
//           { path: "/create-new-stock", component: NewStockAdjustment },
//           { path: "/scrap", component: Scrap },
//           { path: "/new-scrap", component: NewScrap },
//           { path: "/stock-moves", component: StockMoves },
//         ].map(({ path, component }, index) => (
//           <Route
//             key={index}
//             path={tenant ? getTenantUrl(tenant, path) : path}
//             render={() => {
//               if (tenant) {
//                 redirectToTenantRoute(tenant, path);
//                 return null;
//               }
//               return React.createElement(component);
//             }}
//           />
//         ))}

//         {/* Fallback for 404 */}
//         {/* 404 NotFound route with NoHeaderLayout */}
//         <Route
//           path="*"
//           render={() => (
//             <NoHeaderLayout>
//               <NotFound />
//             </NoHeaderLayout>
//           )}
//         />
//       </Switch>
//     </div>
//   );
// }

// export default App;
