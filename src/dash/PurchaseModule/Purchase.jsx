import React from "react";
import styled from "styled-components";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Purchreq from "./PurchRequest/Purchreq";
import Rfq from "./Rfq/Rfq";
import Vend from "./Vendor/Vend";
import Prod from "./Product/Prod";
import PurchaseOrder from "./PurchOrder/PurchaseOrder";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import Bg from "../../../src/image/bg.svg";

export default function Purchase() {
  return (
    <Router>
      <Purcont id="purchase">
        <Switch>
          {/* Define routes within the Switch */}
          <Route exact path="/purchase" component={Purchreq} />
          <Route path="/rfq" component={Rfq} />
          <Route path="/vendor" component={Vend} />
          <Route path="/product" component={Prod} />
          <Route path="/purchase-order" component={PurchaseOrder} />
          <Route path="/configurations" component={ConfigurationSettings} />
        </Switch>
      </Purcont>
    </Router>
  );
}

// Styled component for background
const Purcont = styled.div`
  height: 120vh;
  width: 100%;
  background-image: url(${Bg});
  background-size: contain;
  margin: 0;
  padding: 0;
  font-family: Product Sans, sans-serif;
  overflow: auto;
`;
