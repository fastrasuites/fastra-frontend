import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useLocation,
} from "react-router-dom";
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
import Company from "./dash/Settings/company/Company";
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

function App() {
  const location = useLocation();
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
  ];
  return (
    <div className="App">
      {!noHeaderRoutes.includes(location.pathname) && <Purchead />}
      {!noHeadRoutes.includes(location.pathname) && <Sethead />}
      <GlobalStyle />
      <Switch>
        <Route exact path="/" component={Register} />
        <Route path="/verify-email" component={EmailVerification} />
        <Route path="/login" component={Login} />
        <Route path="/fogpas" component={ForgetPassword} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/contact" component={Contact} />
        <Route path="/settings" component={Settings} />
        <Route path="/apk" component={Apk} />
        <Route path="/company" component={Company} />
        <Route path="/user" component={User} />
        <Route path="/purchase" component={Purchase} />
        <Route path="/npr" component={Newpr} />
        <Route path="/papr" component={Papr} />
        <Route path="/crfq" component={CRfq} />
        <Route path="/rfq" component={Rfq} />
        <Route path="/newrfq" component={Rform} />
        <Route path="/rapr" component={Rapr} />
        <Route path="/pod" component={PurchaseOrder} />
        <Route path="/newPurchaseOrder" component={POrderform} />
        <Route path="/orapr" component={Orapr} />
        <Route path="/vend" component={Vend} />
        <Route path="/vendetails" component={VendorDetails} />
        <Route path="/Newvendor" component={Newvendor} />
        <Route path="/varcat" component={Varcat} />
        <Route path="/edit" component={Edit} />
        <Route path="/prod" component={Prod} />
        <Route path="/prodetails" component={ProductDetails} />
        <Route path="/Newprod" component={Newprod} />
        <Route path="/procat" component={Procat} />
        <Route path="/pedit" component={Pedit} />
      </Switch>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
