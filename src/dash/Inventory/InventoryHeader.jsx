import React from "react";
import DashboardHeader from "../DashboardHeader/DashboardHeader";

const InventoryHeader = () => {
  const menuItems = [
    {
      label: "Operations",
      link: "/inventory/operations",
      subItems: [
        { label: "Incoming Product", link: "/incoming-product" },
        { label: "Delivery Order", link: "/delivery-order" },
        { label: "Internal Transfer", link: "/internal-transfer" },
      ],
    },
    {
      label: "Stocks",
      link: "/inventory/stock",
      subItems: [
        { label: "Stock Adjustment", link: "/stock-adjustment" },
        { label: "Stock Moves", link: "/stock-moves" },
        { label: "Scrap", link: "/scrap" },
      ],
    },
    { label: 'Location', link: '/location' },
    { label: 'Configuration', link: '/location-configuration' },
  ];

  return (
    <div>
      {/* Inventory Header Component */}
      <DashboardHeader title="Inventory" menuItems={menuItems} />
      {/* Other Inventory Page Content */}
    </div>
  );
};

export default InventoryHeader;
