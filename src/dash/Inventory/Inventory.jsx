// InventoryLayout.js
import React from "react";
import { Switch, Route, useRouteMatch, Redirect } from "react-router-dom";
import InventoryHeader from "./InventoryHeader";
import Operations from "./Operations/Operations";
import Location from "./Location/Location";
import MaterialConsumption from "./Operations/MaterialConsumption/MaterialConsumption";
import LocationConfiguration from "./LocationConfiguration/LocationConfig";
import StockAdjustment from "./stock/StockAdjustment/StockAdjustment";
import NewStockAdjustment from "./stock/StockAdjustment/StockAdjustmentForm/NewStockAdjustment";
import Scrap from "./stock/scrap/Scrap";
import CreateIncomingProduct from "./Operations/IncomingProduct/CreateIncomingProduct/CreateIncomingProduct";
import StockMoves from "./stock/StockMoves/StockMoves";
import LocationForm from "./Location/CreateLocation/LocationForm";
import ScrapForm from "./stock/scrap/ScrapForm/ScrapForm";
import MaterialConsumptionForm from "./Operations/MaterialConsumption/MaterialConsumptionForm/MaterialConsumptionForm";
import InternalTransfer from "./Operations/InternalTransfer/InternalTransfer";
import InternalTransferForm from "./Operations/InternalTransfer/InternalTransferForm/InternalTransferForm";
import IncomingProductInfo from "./Operations/IncomingProduct/IncomingProductInfo/IncomingProductInfo";
import LocationInfo from "./Location/LocationInfo/LocationInfo";
import ScrapInfo from "./stock/scrap/ScrapInfo/ScrapInfo";
import StockAdjustmentInfo from "./stock/StockAdjustment/StockAdjustmentInfo/StockAdjustmentInfo";
import InternalTransferInfo from "./Operations/InternalTransfer/InternalTransferInfo/InternalTransferInfo";
import EditStockAdjustment from "./stock/StockAdjustment/StockAdjustmentForm/EditStockAdjustment";

const InventoryLayout = () => {
  const { path } = useRouteMatch();
  return (
    <div>
      <InventoryHeader />
      <div id="inventory">
        <Switch>
          {/* Redirect from /inventory to /inventory/operations */}
          <Redirect exact from={path} to={`${path}/operations`} />

          {/* Inventory Operation Routes */}
          <Route exact path={`${path}/operations`} component={Operations} />
          <Route
            path={`${path}/operations/incoming-product/:id`}
            component={IncomingProductInfo}
          />
          <Route
            path={`${path}/operations/creat-incoming-product`}
            component={CreateIncomingProduct}
          />

          <Route
            exact
            path={`${path}/operations/material-consumption`}
            component={MaterialConsumption}
          />
          <Route
            exact
            path={`${path}/operations/material-consumption/create-material-consumption`}
            component={MaterialConsumptionForm}
          />

          <Route
            exact
            path={`${path}/operations/internal-transfer`}
            component={InternalTransfer}
          />
          <Route
            exact
            path={`${path}/operations/internal-transfer/create-internal-transfer`}
            component={InternalTransferForm}
          />

          <Route
            exact
            path={`${path}/operations/internal-transfer/:id`}
            component={InternalTransferInfo}
          />

          {/* Inventory Location Routes */}
          <Route exact path={`${path}/location`} component={Location} />
          <Route
            path={`${path}/location/create-inventory-location`}
            component={LocationForm}
          />
          <Route path={`${path}/location/:id`} component={LocationInfo} />
          <Route
            path={`${path}/location-configuration`}
            component={LocationConfiguration}
          />

          {/* Inventory Stock Routes */}
          <Route
            exact
            path={`${path}/stock/stock-adjustment`}
            component={StockAdjustment}
          />
          <Route
            exact
            path={`${path}/stock/stock-adjustment/create-stock-adjustment`}
            component={NewStockAdjustment}
          />
          <Route
            exact
            path={`${path}/stock/stock-adjustment/:id`}
            component={StockAdjustmentInfo}
          />

          <Route
            path={`${path}/stock/stock-adjustment/:id/edit`}
            component={EditStockAdjustment}
          />

          <Route path={`${path}/stock/stock-moves`} component={StockMoves} />

          {/* Inventory Scrap Routes */}

          <Route exact path={`${path}/stock/scrap`} component={Scrap} />
          <Route
            exact
            path={`${path}/stock/scrap/create-scrap`}
            component={ScrapForm}
          />
          <Route path={`${path}/stock/scrap/:id`} component={ScrapInfo} />

          {/* Additional inventory routes can be added here */}
        </Switch>
      </div>
    </div>
  );
};

export default InventoryLayout;
