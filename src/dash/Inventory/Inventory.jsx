// InventoryLayout.js
import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import InventoryHeader from "./InventoryHeader";
import Operations from "./Operations/Operations";
import Location from "./Location/Location";
import LocationForm from "./Location/LocationForm";
import MaterialConsumption from "./Operations/MaterialConsumption/MaterialConsumption";
import LocationConfiguration from "./LocationConfiguration/LocationConfig";
import StockAdjustment from "./stock/StockAdjustment/StockAdjustment";
import NewStockAdjustment from "./stock/StockAdjustment/StockAdjustmentForm/NewStockAdjustment";
import Scrap from "./stock/scrap/Scrap";
import NewScrap from "./stock/scrap/NewScrap";
import CreateIncomingProduct from "./Operations/IncomingProduct/CreateIncomingProduct/CreateIncomingProduct";
import StockMoves from "./stock/StockMoves/StockMoves";
import StockMovesForm from "./stock/scrap/StockMovesForm/StockMovesForm";

const InventoryLayout = () => {
  const { path } = useRouteMatch();

  return (
    <div>
      <InventoryHeader />
      <div id="inventory">
        <Switch>
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
          <Route path={`${path}/stock/create-stock-moves`} component={StockMovesForm} />

          {/* Inventory Scrap Routes */}

          <Route path={`${path}/stock/scrap`} component={Scrap} />
          <Route path={`${path}/stock/create-new-scrap`} component={NewScrap} />

          {/* Additional inventory routes can be added here */}
        </Switch>
      </div>
    </div>
  );
};

export default InventoryLayout;
