import React from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBook,
  FaDollarSign,
  FaIndustry,
  FaWarehouse,
  FaUsers,
  FaAddressBook,
  FaCogs,
} from "react-icons/fa";
import './sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <img src="logo.png" alt="Logo" className="sidebar-logo" />
        <span className="sidebar-title">fastra suite</span>
      </div>
      <div className="sidebar-menu">
        <Link to="/dashboard" className="sidebar-item" activeClassName="selected">
          <FaTachometerAlt className="sidebar-icon" />
          <span>Dashboard</span>
        </Link>
        <Link to="/books" className="sidebar-item" activeClassName="selected">
          <FaBook className="sidebar-icon" />
          <span>Books</span>
        </Link>
        <Link to="/sell" className="sidebar-item" activeClassName="selected">
          <FaDollarSign className="sidebar-icon" />
          <span>Sell</span>
        </Link>
        <Link to="/source" className="sidebar-item" activeClassName="selected">
          <FaIndustry className="sidebar-icon" />
          <span>Source</span>
        </Link>
        <Link to="/stock" className="sidebar-item" activeClassName="selected">
          <FaWarehouse className="sidebar-icon" />
          <span>Stock</span>
        </Link>
        <Link to="/talent" className="sidebar-item" activeClassName="selected">
          <FaUsers className="sidebar-icon" />
          <span>Talent</span>
        </Link>
        <Link to="/contact" className="sidebar-item" activeClassName="selected">
          <FaAddressBook className="sidebar-icon" />
          <span>Contacts</span>
        </Link>
      </div>
      <div className="sidebar-footer">
        <Link to="/settings" className="sidebar-item" activeClassName="selected">
          <FaCogs className="sidebar-icon" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
