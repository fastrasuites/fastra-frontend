import React from "react";
import DashboardHeader from "../DashboardHeader/DashboardHeader";
import { useTenant } from "../../context/TenantContext";

const InvoicingHeader = () => {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  const menuItems = [];

  const subItems = [];

  subItems.push({
    label: "Paid Invoices",
    link: `/${tenant_schema_name}/invoicing/paid?status=paid`,
  });

  subItems.push({
    label: "Partially Paid Invoices",
    link: `/${tenant_schema_name}/invoicing/paid?status=partial`,
  });

  subItems.push({
    label: "Unpaid Invoices",
    link: `/${tenant_schema_name}/invoicing/paid?status=unpaid`,
  });

  subItems.push({
    label: "Payment History",
    link: `/${tenant_schema_name}/invoicing/payment-history`,
  });

  if (subItems.length > 0) {
    menuItems.push({
      label: "Invoices",
      link: `/${tenant_schema_name}/invoicing/invoices`,
      subItems,
    });
  }

  // Payments -------------------------
  menuItems.push({
    label: "Payments",
    link: `/${tenant_schema_name}/invoicing/payments`,
  });

  // Add more menu items and submenu items below

  return (
    <div>
      <DashboardHeader title="Invoices" menuItems={menuItems} />
    </div>
  );
};

export default InvoicingHeader;
