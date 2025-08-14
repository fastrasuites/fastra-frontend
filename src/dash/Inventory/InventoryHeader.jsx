import React from "react";
import DashboardHeader from "../DashboardHeader/DashboardHeader";
import { useTenant } from "../../context/TenantContext";
import {
  extractPermissions,
  getPermissionsByApp,
} from "../../helper/extractPermissions";

const InventoryHeader = () => {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  const permissionsMap = extractPermissions(tenantData?.user_accesses || {});
  const inventoryPermissions = getPermissionsByApp("inventory", permissionsMap);

  const isAdmin = permissionsMap["*:*:*"] === true;

  // Utility to check permission
  const hasPermission = (key) => {
    return isAdmin || !!inventoryPermissions[key];
  };

  const menuItems = [];

  // Operations section
  if (
    hasPermission("inventory:incomingproduct:view") ||
    hasPermission("inventory:deliveryorder:view")
  ) {
    const subItems = [];

    if (hasPermission("inventory:incomingproduct:view")) {
      subItems.push({
        label: "Incoming Product",
        link: `/${tenant_schema_name}/inventory/operations`,
      });
    }

    if (hasPermission("inventory:deliveryorder:view")) {
      subItems.push({
        label: "Delivery Order",
        link: `/${tenant_schema_name}/inventory/operations/delivery-order`,
      });
    }

    if (hasPermission("inventory:deliveryorder:view")) {
      subItems.push({
        label: "Returns",
        link: `/${tenant_schema_name}/inventory/operations/delivery-order-returns`,
      });
    }

    subItems.push({
      label: "Back Order",
      link: `/${tenant_schema_name}/inventory/operations/back-orders`,
    });

    if (subItems.length > 0) {
      menuItems.push({
        label: "Operations",
        link: `/${tenant_schema_name}/inventory/operations`,
        subItems,
      });
    }
  }

  // Stocks section
  if (
    hasPermission("inventory:stockadjustment:view") ||
    hasPermission("inventory:stockmoves:view") ||
    hasPermission("inventory:scrap:view")
  ) {
    const subItems = [];

    if (hasPermission("inventory:stockadjustment:view")) {
      subItems.push({
        label: "Stock Adjustment",
        link: `/${tenant_schema_name}/inventory/stock/stock-adjustment`,
      });
    }

    if (hasPermission("inventory:stockmoves:view")) {
      subItems.push({
        label: "Stock Moves",
        link: `/${tenant_schema_name}/inventory/stock/stock-moves`,
      });
    }

    if (hasPermission("inventory:scrap:view")) {
      subItems.push({
        label: "Scrap",
        link: `/${tenant_schema_name}/inventory/stock/scrap`,
      });
    }

    if (subItems.length > 0) {
      menuItems.push({
        label: "Stocks",
        link: `/${tenant_schema_name}/inventory/stock`,
        subItems,
      });
    }
  }

  // Location
  if (hasPermission("inventory:location:view")) {
    menuItems.push({
      label: "Location",
      link: `/${tenant_schema_name}/inventory/location`,
    });
  }

  // Configuration
  if (hasPermission("inventory:multilocation:view")) {
    menuItems.push({
      label: "Configuration",
      link: `/${tenant_schema_name}/inventory/location-configuration`,
    });
  }

  return (
    <div>
      <DashboardHeader title="Inventory" menuItems={menuItems} />
    </div>
  );
};

export default InventoryHeader;
