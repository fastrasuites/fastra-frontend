import React from "react";
import { useTenant } from "../../context/TenantContext";
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
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  return (
    <Router>
      <Purcont id="purchase">
        <Switch>
          {/* Define routes within the Switch */}
          <Route
            exact
            path={`/${tenant_schema_name}/purchase`}
            component={Purchreq}
          />
          <Route path={`/${tenant_schema_name}/rfq`} component={Rfq} />
          <Route path={`/${tenant_schema_name}/vendor`} component={Vend} />
          <Route path={`/${tenant_schema_name}/product`} component={Prod} />
          <Route
            path={`/${tenant_schema_name}/purchase-order`}
            component={PurchaseOrder}
          />
          <Route
            path={`/${tenant_schema_name}/configurations`}
            component={ConfigurationSettings}
          />
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
