import React from "react";
import styled from "styled-components";
import { Route, Switch, Redirect, useRouteMatch } from "react-router-dom";
import Purchreq from "./PurchRequest/Purchreq";
import Rfq from "./Rfq/Rfq";
import Vend from "./Vendor/Vend";
import Prod from "./Product/Prod";
import PurchaseOrder from "./PurchOrder/PurchaseOrder";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import PurchaseHeader from "./PurchaseHeader";
import PurchaseRequestInfo from "./PurchRequest/PurchaseRequestInfo/PurchaseRequestInfo";
import CreatePRForm from "./PurchRequest/CreatePRForm/CreatePRForm";
import PurchaseRequestStatus from "./PurchRequest/PurchaseRequestStatus/PurchaseRequestStatus";
import RFQInfo from "./Rfq/RFQInfo/RFQInfo";
import RfqForm from "./Rfq/RfqForm/RfqForm";
import RFQStatus from "./Rfq/RFQStatus/RFQStatus";

import POForm from "./PurchOrder/POForm/POForm";
import PurchaseOrderStatus from "./PurchOrder/PurchaseOrderStatus/PurchaseOrderStatus";
import PurchaseOrderInfo from "./PurchOrder/PurchaseOrderInfo/PurchaseOrderInfo";

export default function PurchaseLayout() {
  const { path} = useRouteMatch(); // path is used to match, url is used for links
  return (
    <>
      <PurchaseHeader />
      <Purcont id="purchase">
        <Switch>
          <Redirect exact from={path} to={`${path}/purchase-request`} />
          <Route exact path={`${path}/purchase-request`} component={Purchreq} />
          <Route exact path={`${path}/purchase-request/new`} component={CreatePRForm} />
          <Route exact path={`${path}/purchase-request/:id/edit`} component={CreatePRForm} />
          <Route exact path={`${path}/purchase-request/:id`} component={PurchaseRequestInfo} />
          <Route exact path={`${path}/purchase-request/status/:status`} component={PurchaseRequestStatus} />

          <Route exact path={`${path}/request-for-quotations`} component={Rfq} />
          <Route exact path={`${path}/request-for-quotations/new`} component={RfqForm} />
          <Route exact path={`${path}/request-for-quotations/:id/edit`} component={RfqForm} />
          <Route exact path={`${path}/request-for-quotations/:id`} component={RFQInfo} />
          <Route exact path={`${path}/request-for-quotations/status/:status`} component={RFQStatus} />


          <Route exact path={`${path}/purchase-order`} component={PurchaseOrder} />
          <Route exact path={`${path}/purchase-order/new`} component={POForm} />
          <Route exact path={`${path}/purchase-order/:id`} component={PurchaseOrderInfo} />
          <Route exact path={`${path}/purchase-order/status/:status`} component={PurchaseOrderStatus} />
          <Route exact path={`${path}/purchase-order/:id/edit`} component={POForm} />
        
         





          <Route exact path={`${path}/rfq`} component={Rfq} />
          <Route exact path={`${path}/vendor`} component={Vend} />
          <Route exact path={`${path}/product`} component={Prod} />
          <Route exact path={`${path}/configurations`} component={ConfigurationSettings} />
        </Switch>
      </Purcont>
    </>
  );
}

const Purcont = styled.div`
  min-height: 100vh;
  width: 100%;
  background-size: contain;
  margin: 0;
  padding: 0;
  font-family: Product Sans, sans-serif;
  overflow: auto;
`;
