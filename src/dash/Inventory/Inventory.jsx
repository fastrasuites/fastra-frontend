// InventoryLayout.js
import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import InventoryHeader from "./InventoryHeader";
import Operations from "./Operations/Operations";
import IncomingProductLessOrMore from "./Operations/IncomingProduct/IncomingProductLessOrMore";
import Location from "./Location/Location";
import LocationForm from "./Location/LocationForm";
import MaterialConsumption from "./Operations/MaterialConsumption/MaterialConsumption";
import LocationConfiguration from "./LocationConfiguration/LocationConfig";
import StockAdjustment from "./stock/StockAdjustment";
import NewStockAdjustment from "./stock/NewStockAdjustment";
import StockMoves from "./StockMoves/StockMoves";
import Scrap from "./scrap/Scrap";
import NewScrap from "./scrap/NewScrap";

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
            component={IncomingProductLessOrMore}
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
            path={`${path}/stock/create-new-stock`}
            component={NewStockAdjustment}
          />
          <Route path={`${path}/stock/stock-moves`} component={StockMoves} />
          <Route path={`${path}/stock/scrap`} component={Scrap} />
          <Route path={`${path}/stock/create-new-scrap`} component={NewScrap} />

          {/* Additional inventory routes can be added here */}
        </Switch>
      </div>
    </div>
  );
};

export default InventoryLayout;
