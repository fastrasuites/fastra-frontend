import styled from "styled-components";
import Purchreq from "./PurchRequest/Purchreq";
import Rfq from "./Rfq/Rfq";
import Bg from "../../image/bg.svg";
import Vend from "./Vendor/Vend";
import Prod from "./Product/Prod";
import PurchaseOrder from "./PurchOrder/PurchaseOrder";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

export default function Purchase() {
  return (
    <Router>
      <Purcont id="purchase">
        <Switch>
          <Route path="/purchase" component={Purchreq} />
          <Route path="/rfq" component={Rfq} />
          <Route path="/vend" component={Vend} />
          <Route path="/prod" component={Prod} />
          <Route path="/pod" component={PurchaseOrder} />
          <Route path="/configurations" component={ConfigurationSettings } />
        </Switch>
      </Purcont>
    </Router>
  );
}

const Purcont = styled.div`
  height: 120vh;
  width: 100%;
  background-image: url(${Bg});
  background-size: contain;
  margin: 0;
  padding: 0;
  font-family: Product Sans;
  overflow: auto;
`;
