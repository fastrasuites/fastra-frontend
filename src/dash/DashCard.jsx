import "./DashCard.css";
import { useTenant } from "../context/TenantContext";
import account from "../image/account.svg";
import purchase from "../image/purchase.svg";
import sales from "../image/sales.svg";
import inventory from "../image/inventory.svg";
import hr from "../image/hr.svg";
import costing from "../image/costing.svg";
import crm from "../image/crm.svg";
import contact from "../image/contact.svg";
import plan from "../image/plan.svg";
import manufacture from "../image/manufacture.svg";
import logistics from "../image/logistics.svg";
import report from "../image/report.svg";
import settings from "../image/settings.svg";
import app from "../image/app.svg";
import dots from "../image/dots.svg";
import { Link } from "react-router-dom";
import {
  extractPermissions,
  getPermissionsByApp,
} from "../helper/extractPermissions";
import { Box } from "@mui/material";

const Card = ({ name, description, link }) => {
  let icon;
  switch (name) {
    case "Account":
      icon = account;
      break;
    case "Purchase":
      icon = purchase;
      break;
    case "Sales":
      icon = sales;
      break;
    case "Inventory":
      icon = inventory;
      break;
    case "HR":
      icon = hr;
      break;
    case "Project Costing":
      icon = costing;
      break;
    case "CRM":
      icon = crm;
      break;
    case "Contact":
      icon = contact;
      break;
    case "Planning":
      icon = plan;
      break;
    case "Manufacturing":
      icon = manufacture;
      break;
    case "Logistics":
      icon = logistics;
      break;
    case "Reports":
      icon = report;
      break;
    case "App":
      icon = app;
      break;
    case "Settings":
      icon = settings;
      break;
    default:
      icon = null;
      break;
  }

  const icon2 = dots;

  return (
    <Link to={link} className="card">
      {icon && <img src={icon} alt={name} />}
      <div className="cardtext">
        <h3 className="cardhed">{name}</h3>
        <p className="cardesc">{description}</p>
      </div>
      {icon2 && <img src={icon2} alt={`${name} menu`} />}
    </Link>
  );
};

const DashCard = () => {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const permissionsMap = extractPermissions(tenantData?.user_accesses || []);

  // Example:
  const purchasePermissions =
    Object.keys(getPermissionsByApp("purchase", permissionsMap)).length > 0;
  const inventoryPermissions =
    Object.keys(getPermissionsByApp("inventory", permissionsMap)).length > 0;
  const settingsPermissions =
    Object.keys(getPermissionsByApp("settings", permissionsMap)).length > 0;

  const fastra = [
    {
      name: "Purchase",
      description:
        "Streamline procurement processes by tracking purchase orders, vendor management, and inventory replenishment to optimize supply chain efficiency and cost savings.",
      link: `/${tenant_schema_name}/purchase/purchase-request`,
      hasAccess: purchasePermissions,
    },
    {
      name: "Inventory",
      description:
        "Monitor stock levels, track inventory movements, and optimize warehouse operations to ensure optimal inventory management and minimize stockouts.",
      link: `/${tenant_schema_name}/inventory/operations`,
      hasAccess: inventoryPermissions,
    },
    {
      name: "Settings",
      description:
        "Configure system preferences, manage user permissions, and customize application settings to align with organizational requirements and user preferences.",
      link: `/${tenant_schema_name}/settings`,
      hasAccess: settingsPermissions,
    },
    // {
    //   name: "Account",
    //   description:
    //     "Manage all financial transactions, including invoicing, billing, and ledger entries, to ensure accurate accounting records and financial reporting.",
    //   link: `/${tenant_schema_name}/account`,
    // },

    // {
    //   name: "Sales",
    //   description:
    //     "Track sales leads, manage customer relationships, and monitor sales performance to drive revenue growth and customer satisfaction.",
    //   link: `/${tenant_schema_name}/sales`,
    // },

    // {
    //   name: "HR",
    //   description:
    //     "Manage employee information, track attendance, process payroll, and oversee performance evaluations to support efficient HR administration and talent management.",
    //   link: `/${tenant_schema_name}/hr`,
    // },
    // {
    //   name: "Project Costing",
    //   description:
    //     "Track project expenses, monitor budget allocations, and analyze project profitability to ensure projects are delivered on time and within budget.",
    //   link: `/${tenant_schema_name}/costing`,
    // },
    // {
    //   name: "CRM",
    //   description:
    //     "Maintain a centralized database of customer information, track interactions, and manage sales pipelines to enhance customer relationships and boost sales effectiveness.",
    //   link: `/${tenant_schema_name}/crm`,
    // },
    // {
    //   name: "Contact",
    //   description:
    //     "Store and organize contact information for customers, vendors, and other stakeholders to facilitate communication and collaboration.",
    //   link: `/${tenant_schema_name}/contact`,
    // },
    // {
    //   name: "Planning",
    //   description:
    //     "Collaborate on strategic planning, set goals, allocate resources, and track progress towards objectives to drive organizational growth and success.",
    //   link: `/${tenant_schema_name}/planning`,
    // },
    // {
    //   name: "Manufacturing",
    //   description:
    //     "Manage production processes, track work orders, and optimize resource allocation to maximize manufacturing efficiency and product quality.",
    //   link: `/${tenant_schema_name}/manufacturing`,
    // },
    // {
    //   name: "Logistics",
    //   description:
    //     "Coordinate transportation, manage delivery schedules, and track shipment statuses to ensure timely and cost-effective logistics operations.",
    //   link: `/${tenant_schema_name}/logistics`,
    // },
    // {
    //   name: "Reports",
    //   description:
    //     "Generate customizable reports, analyze key performance metrics, and gain actionable insights to support data-driven decision-making and business optimization.",
    //   link: `/${tenant_schema_name}/reports`,
    // },
    // {
    //   name: "App",
    //   description:
    //     "Explore additional applications and integrations to extend the functionality of the Fastra suite and address specific business needs and requirements.",
    //   link: `/${tenant_schema_name}/apk`,
    // },
  ];
  return (
    <Box mt={4} display={"grid"} gridTemplateColumns={"1fr 1fr 1fr"} gap={4}>
      {fastra
        .filter((item) => item.hasAccess)
        .map((fastra, index) => (
          <Card
            key={index}
            name={fastra.name}
            description={fastra.description}
            link={fastra.link}
          />
        ))}
    </Box>
  );
};

export default DashCard;
