import "./DashCard.css";
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

const Card = ({ name, description }) => {
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
    case "Settings":
      icon = settings;
      break;
    case "App":
      icon = app;
      break;
    default:
      icon = null;
      break;
  }
  let icon2;
  switch (name) {
    case "Account":
      icon2 = dots;
      break;
    case "Purchase":
      icon2 = dots;
      break;
    case "Sales":
      icon2 = dots;
      break;
    case "Inventory":
      icon2 = dots;
      break;
    case "HR":
      icon2 = dots;
      break;
    case "Project Costing":
      icon2 = dots;
      break;
    case "CRM":
      icon2 = dots;
      break;
    case "Contact":
      icon2 = dots;
      break;
    case "Planning":
      icon2 = dots;
      break;
    case "Manufacturing":
      icon2 = dots;
      break;
    case "Logistics":
      icon2 = dots;
      break;
    case "Reports":
      icon2 = dots;
      break;
    case "Settings":
      icon2 = dots;
      break;
    case "App":
      icon2 = dots;
      break;
    default:
      icon2 = null;
      break;
  }

  return (
    <div className="card">
      {icon && <img src={icon} alt={name} />}
      <div className="cardtext">
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
      {icon2 && <img src={icon2} alt={name} />}
    </div>
  );
};

const fastra = [
  {
    name: "Account",
    description:
      "Manage all financial transactions, including invoicing, billing, and ledger entries, to ensure accurate accounting records and financial reporting.",
  },
  {
    name: "Purchase",
    description:
      "Streamline procurement processes by tracking purchase orders, vendor management, and inventory replenishment to optimize supply chain efficiency and cost savings.",
  },
  {
    name: "Sales",
    description:
      "Track sales leads, manage customer relationships, and monitor sales performance to drive revenue growth and customer satisfaction.",
  },
  {
    name: "Inventory",
    description:
      "Monitor stock levels, track inventory movements, and optimize warehouse operations to ensure optimal inventory management and minimize stockouts.",
  },
  {
    name: "HR",
    description:
      "Manage employee information, track attendance, process payroll, and oversee performance evaluations to support efficient HR administration and talent management.",
  },
  {
    name: "Project Costing",
    description:
      "Track project expenses, monitor budget allocations, and analyze project profitability to ensure projects are delivered on time and within budget.",
  },
  {
    name: "CRM",
    description:
      "Maintain a centralized database of customer information, track interactions, and manage sales pipelines to enhance customer relationships and boost sales effectiveness.",
  },
  {
    name: "Contact",
    description:
      "Store and organize contact information for customers, vendors, and other stakeholders to facilitate communication and collaboration.",
  },
  {
    name: "Planning",
    description:
      "Collaborate on strategic planning, set goals, allocate resources, and track progress towards objectives to drive organizational growth and success.",
  },
  {
    name: "Manufacturing",
    description:
      "Manage production processes, track work orders, and optimize resource allocation to maximize manufacturing efficiency and product quality.",
  },
  {
    name: "Logistics",
    description:
      "Coordinate transportation, manage delivery schedules, and track shipment statuses to ensure timely and cost-effective logistics operations.",
  },
  {
    name: "Reports",
    description:
      "Generate customizable reports, analyze key performance metrics, and gain actionable insights to support data-driven decision-making and business optimization.",
  },
  {
    name: "Settings",
    description:
      "Configure system preferences, manage user permissions, and customize application settings to align with organizational requirements and user preferences.",
  },
  {
    name: "App",
    description:
      "Explore additional applications and integrations to extend the functionality of the Fastra suite and address specific business needs and requirements.",
  },
];

const DashCard = () => {
  return (
    <div className="cardlist">
      {fastra.map((fastra, index) => (
        <Card key={index} name={fastra.name} description={fastra.description} />
      ))}
    </div>
  );
};

export default DashCard;
