import React from "react";
import DashboardHeader from "../DashboardHeader/DashboardHeader";
import { useTenant } from "../../context/TenantContext";

const PurchaseHeader = () => {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const menuItems = [
    { label: "Purchase Requests", link: `/${tenant_schema_name}/purchase` },
    { label: "RFQs", link: `/${tenant_schema_name}/rfq` },
    { label: "Purchase Orders", link: `/${tenant_schema_name}/purchase-order` },
    {
      label: "Vendors",
      link: `/${tenant_schema_name}/vendor`,
      subItems: [
        { label: "Vendors Bills", link: `/${tenant_schema_name}/vendor-bill` },
        { label: "Vendors", link: `/${tenant_schema_name}/vendor` },
      ],
    },
    {
      label: "Products",
      link: `/${tenant_schema_name}/prod`,
      subItems: [
        {
          label: "Incoming Products",
          link: `/${tenant_schema_name}/incoming-product`,
        },
        { label: "Products", link: `/${tenant_schema_name}/product` },
      ],
    },
    {
      label: "Configurations",
      link: `/${tenant_schema_name}/purchase-configuration-settings`,
    },
  ];

  return (
    <div style={{width: "100%", background: "#fff"}}>
      {/* Header Component */}
      <DashboardHeader title="Purchase" menuItems={menuItems} />
    </div>
  );
};

export default PurchaseHeader;
