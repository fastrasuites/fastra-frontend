// InventoryHeader.js
import React from "react";
import DashboardHeader from "../DashboardHeader/DashboardHeader";
import { useTenant } from "../../context/TenantContext";

const InventoryHeader = () => {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const menuItems = [
    {
      label: "Operations",
      link: `/${tenant_schema_name}/inventory/operations`,
      subItems: [
        {
          label: "Incoming Product",
          link: `/${tenant_schema_name}/inventory/operations`,
        },
        {
          label: "Delivery Order",
          link: `/${tenant_schema_name}/delivery-order`,
        },
        {
          label: "Internal Transfer",
          link: `/${tenant_schema_name}/inventory/operations/internal-transfer`,
        },
        {
          label: "Material Consumption",
          link: `/${tenant_schema_name}/inventory/operations/material-consumption`,
        },
      ],
    },
    {
      label: "Stocks",
      link: `/${tenant_schema_name}/inventory/stock`,
      subItems: [
        {
          label: "Stock Adjustment",
          link: `/${tenant_schema_name}/inventory/stock/stock-adjustment`,
        },
        {
          label: "Stock Moves",
          link: `/${tenant_schema_name}/inventory/stock/stock-moves`,
        },
        {
          label: "Scrap",
          link: `/${tenant_schema_name}/inventory/stock/scrap`,
        },
      ],
    },
    {
      label: "Location",
      link: `/${tenant_schema_name}/inventory/location`,
    },
    {
      label: "Configuration",
      link: `/${tenant_schema_name}/inventory/location-configuration`,
    },
  ];

  return (
    <div>
      {/* Inventory Header Component */}
      <DashboardHeader title="Inventory" menuItems={menuItems} />
      {/* Additional header content can be added here */}
    </div>
  );
};

export default InventoryHeader;
