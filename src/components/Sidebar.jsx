import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaMoneyBillAlt, FaBoxes, FaUserCircle, FaUsersCog, FaSignOutAlt } from 'react-icons/fa';
import "./sidebar.css"

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="logo.png" alt="Logo" className="sidebar-logo" />
        <h3 className="sidebar-title">fastra suite</h3>
      </div>
      <div className="sidebar-menu">
        <Link to="/home" className="sidebar-item">
          <FaHome className="sidebar-icon" />
          <span>Home</span>
        </Link>
        <Link to="/accounts" className="sidebar-item">
          <FaMoneyBillAlt className="sidebar-icon" />
          <span>Accounts</span>
        </Link>
        <Link to="/purchase" className="sidebar-item">
          <FaBoxes className="sidebar-icon" />
          <span>Purchase</span>
        </Link>
        <Link to="/sales" className="sidebar-item">
          <FaMoneyBillAlt className="sidebar-icon" />
          <span>Sales</span>
        </Link>
        <Link to="/inventory" className="sidebar-item">
          <FaBoxes className="sidebar-icon" />
          <span>Inventory</span>
        </Link>
        <Link to="/hr" className="sidebar-item">
          <FaUserCircle className="sidebar-icon" />
          <span>HR</span>
        </Link>
        <Link to="/logistics" className="sidebar-item">
          <FaBoxes className="sidebar-icon" />
          <span>Logistics</span>
        </Link>
        <Link to="/contacts" className="sidebar-item">
          <FaUsersCog className="sidebar-icon" />
          <span>Contacts</span>
        </Link>
        <Link to="/apps" className="sidebar-item">
          <FaBoxes className="sidebar-icon" />
          <span>Apps</span>
        </Link>
        <Link to="/settings" className="sidebar-item">
          <FaUsersCog className="sidebar-icon" />
          <span>Settings</span>
        </Link>
      </div>
      <div className="sidebar-footer">
        <Link to="/logout" className="sidebar-item">
          <FaSignOutAlt className="sidebar-icon" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;