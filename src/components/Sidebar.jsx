import React from "react";
import { Link } from "react-router-dom";
import "./sidebar.css";
import arrowLeft from "../image/sidebar/arrow-left.svg";
import home from "../image/sidebar/home.svg";
import accounts from "../image/sidebar/accounts.svg";
import purchase from "../image/sidebar/purchase.svg";
import sales from "../image/sidebar/sales.svg";
import inventory from "../image/sidebar/inventory.svg";
import hr from "../image/sidebar/hr.svg";
import logistics from "../image/sidebar/logistics.svg";
import contacts from "../image/sidebar/contacts.svg";
import apps from "../image/sidebar/apps.svg";
import settings from "../image/sidebar/settings.svg";

const Sidebar = ({ sidebarOpen, handleCloseSidebar }) => {
  return (
    <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-menu">
        <span className="sidebar-item" onClick={handleCloseSidebar}>
          <img src={arrowLeft} alt="Close Sidebar" className="sidebar-icon" />
        </span>
        
        <Link to="/dashboard" className="sidebar-item" onClick={handleCloseSidebar}>
          <img src={home} alt="Home" className="sidebar-icon" />
          <span>Home</span>
        </Link>

        <Link to="/accounts" className="sidebar-item" onClick={handleCloseSidebar}>
          <img src={accounts} alt="Accounts" className="sidebar-icon" />
          <span>Accounts</span>
        </Link>

        <Link to="/purchase" className="sidebar-item" onClick={handleCloseSidebar}>
          <img src={purchase} alt="Purchase" className="sidebar-icon" />
          <span>Purchase</span>
        </Link>

        <Link to="/sales" className="sidebar-item" onClick={handleCloseSidebar}>
          <img src={sales} alt="Sales" className="sidebar-icon" />
          <span>Sales</span>
        </Link>

        <Link to="/inventory" className="sidebar-item" onClick={handleCloseSidebar}>
          <img src={inventory} alt="Inventory" className="sidebar-icon" />
          <span>Inventory</span>
        </Link>

        <Link to="/hr" className="sidebar-item" onClick={handleCloseSidebar}>
          <img src={hr} alt="HR" className="sidebar-icon" />
          <span>HR</span>
        </Link>

        <Link to="/logistics" className="sidebar-item" onClick={handleCloseSidebar}>
          <img src={logistics} alt="Logistics" className="sidebar-icon" />
          <span>Logistics</span>
        </Link>

        <Link to="/contacts" className="sidebar-item" onClick={handleCloseSidebar}>
          <img src={contacts} alt="Contacts" className="sidebar-icon" />
          <span>Contacts</span>
        </Link>

        <hr style={{ border: "solid 2px #0d3c8c", marginBottom: "8px" }} />

        <Link to="/apps" className="sidebar-item" onClick={handleCloseSidebar}>
          <img src={apps} alt="Apps" className="sidebar-icon" />
          <span>Apps</span>
        </Link>

        <Link to="/settings" className="sidebar-item" onClick={handleCloseSidebar}>
          <img src={settings} alt="Settings" className="sidebar-icon" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
