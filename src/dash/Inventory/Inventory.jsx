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
import DeliveryOrder from "./Operations/DeliveryOrder/DeliveryOrder";
import DeliveryOrderForm from "./Operations/DeliveryOrder/DeliveryOrderForm/DeliveryOrderForm";
import DeliveryOrderInfo from "./Operations/DeliveryOrder/DeliveryOrderInfo/DeliveryOrderInfo";
import EditDeliveryOrderForm from "./Operations/DeliveryOrder/EditDeliveryOrderForm/EditDeliveryOrderForm";
import ScrapEditForm from "./stock/scrap/ScrapForm/ScrapEditForm";
import EditIncomingProduct from "./Operations/IncomingProduct/CreateIncomingProduct/EditIncomingProduct";
import ConvertPoToIncomingProduct from "./Operations/IncomingProduct/CreateIncomingProduct/ConvertPotoIncomingProduct";
import DeliveryOrderReturnForm from "./Operations/DeliveryOrder/DeliveryOrderReturnForm/DeliveryOrderReturnForm";
import DeliveryOrderReturnList from "./Operations/DeliveryOrder/DeliveryOrderReturnList/DeliveryOrderReturnList";
import BackOrderList from "./Operations/BackOrder/BackOrderList/BackOrderList";
import BackOrderDetails from "./Operations/BackOrder/BackOrderDetails/BackOrderDetails";
import ReturnForm from "./Operations/Returns/ReturnForm";
import ReturnIncomingProductForm from "./Operations/Returns/ReturnForm";
import ReturnList from "./Operations/Returns/ReturnsList";
import InternalTransferEditForm from "./Operations/InternalTransfer/InternalTransferForm/InternalTransferEditForm";

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
            exact
            path={`${path}/operations/incoming-product/inventory-conversion`}
            component={ConvertPoToIncomingProduct}
          />

          <Route
            exact
            path={`${path}/operations/creat-incoming-product`}
            component={CreateIncomingProduct}
          />

          <Route
            exact
            path={`${path}/operations/incoming-product/return`}
            component={ReturnList}
          />

          <Route
            exact
            path={`${path}/operations/incoming-product/return/:IP_ID`}
            component={ReturnIncomingProductForm}
          />

          <Route
            exact
            path={`${path}/operations/incoming-product/:id`}
            component={IncomingProductInfo}
          />

          <Route
            exact
            path={`${path}/operations/incoming-product/:id/edit`}
            component={EditIncomingProduct}
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

          <Route
            exact
            path={`${path}/operations/internal-transfer/:id/edit`}
            component={InternalTransferEditForm}
          />

          <Route
            exact
            path={`${path}/operations/delivery-order`}
            component={DeliveryOrder}
          />

          <Route
            exact
            path={`${path}/operations/delivery-order/create-delivery-order`}
            component={DeliveryOrderForm}
          />

          <Route
            exact
            path={`${path}/operations/delivery-order/:id`}
            component={DeliveryOrderInfo}
          />

          <Route
            exact
            path={`${path}/operations/delivery-order/:id/edit`}
            component={EditDeliveryOrderForm}
          />

          {/* Redirect for Delivery Order Return Form */}
          <Route
            exact
            path={`${path}/operations/delivery-order/:id/return`}
            component={DeliveryOrderReturnForm}
          />

          <Route
            exact
            component={DeliveryOrderReturnList}
            path={`${path}/operations/delivery-order-returns`}
          />

          {/* Inventory backOrder Routes */}
          <Route
            exact
            path={`${path}/operations/back-orders`}
            component={BackOrderList}
          />

          <Route
            exact
            path={`${path}/operations/back-orders/:id`}
            component={BackOrderDetails}
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
          <Route
            exact
            path={`${path}/stock/scrap/:id/edit`}
            component={ScrapEditForm}
          />
          <Route path={`${path}/stock/scrap/:id`} component={ScrapInfo} />

          {/* Additional inventory routes can be added here */}
        </Switch>
      </div>
    </div>
  );
};

export default InventoryLayout;
