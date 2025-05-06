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
import StockMovesForm from "./stock/StockMoves/StockMovesForm/StockMovesForm";
import ScrapForm from "./stock/scrap/ScrapForm/ScrapForm";
import MaterialConsumptionForm from "./Operations/MaterialConsumption/MaterialConsumptionForm/MaterialConsumptionForm";
import InternalTransfer from "./Operations/InternalTransfer/InternalTransfer";
import InternalTransferForm from "./Operations/InternalTransfer/InternalTransferForm/InternalTransferForm";

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
            path={`${path}/operations/creat-incoming-product`}
            component={CreateIncomingProduct}
          />
          <Route
            path={`${path}/operations/material-consumption`}
            component={MaterialConsumption}
          />
          <Route
            path={`${path}/operations/create-material-consumption`}
            component={MaterialConsumptionForm}
          />

          <Route
            path={`${path}/operations/internal-transfer`}
            component={InternalTransfer}
          />
          <Route
            path={`${path}/operations/create-internal-transfer`}
            component={InternalTransferForm}
          />

          {/* Inventory Location Routes */}
          <Route exact path={`${path}/location`} component={Location} />
          <Route
            path={`${path}/location/create-inventory-location`}
            component={LocationForm}
          />
          <Route
            path={`${path}/location-configuration`}
            component={LocationConfiguration}
          />

          {/* Inventory Stock Routes */}
          <Route
            path={`${path}/stock/stock-adjustment`}
            component={StockAdjustment}
          />
          <Route
            path={`${path}/stock/create-stock-adjustment`}
            component={NewStockAdjustment}
          />
          <Route path={`${path}/stock/stock-moves`} component={StockMoves} />
          <Route
            path={`${path}/stock/create-stock-moves`}
            component={StockMovesForm}
          />

          {/* Inventory Scrap Routes */}

          <Route path={`${path}/stock/scrap`} component={Scrap} />
          <Route path={`${path}/stock/create-scrap`} component={ScrapForm} />

          {/* Additional inventory routes can be added here */}
        </Switch>
      </div>
    </div>
  );
};

export default InventoryLayout;
