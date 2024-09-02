import React, { useState } from "react";
import { FaBars, FaTimes, FaBell } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import admin from "../../image/admin.svg";
import Sidebar from "../../components/Sidebar";
import "./sethead.css";

export default function Sethead() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const handleLinkClick = () => {
    setShowMenu(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="setting-header">
      <ul className="setting-wrap">
        {/* Sidebar Toggle */}
        <li className="menu" onClick={toggleSidebar}>
          {sidebarOpen ? (
            <FaTimes className="setnav" />
          ) : (
            <FaBars className="setnav" />
          )}
          <h2
            style={{
              fontWeight: '700',
              marginLeft: '20px',
              fontSize: '25px',
              letterSpacing: '1px',
            }}
          >
            Settings
          </h2>
        </li>

        {/* Dropdown Menu Toggle */}
        <li className="setlst">
          {/* "Menu" text with dropdown icon */}
          <div className="menu-toggle" onClick={toggleMenu}>
            {/* <span style={{ cursor: 'pointer', fontWeight: '700' }}>Menu</span> */}
            {/* Show dropdown icon next to "Menu" text */}
            {showMenu ? (
              <FaSortUp className="setnav" id='dropnav' style={{ marginLeft: '-20px', position: "absolute", top: "40%", fontSize: "35px", color: "gray"}} />
            ) : ( 
              <FaSortDown className="setnav" id='dropnav' style={{ marginLeft: '-20px', position: "absolute", top: "20%", fontSize: "35px", color: "gray" }} />
            )}
          </div>
          {/* Render the setlist if showMenu is true */}
          <div className={`setlist ${showMenu ? 'show' : ''}`}>
            <NavLink
              exact
              to="/apk"
              className="setst"
              activeClassName="active"
              onClick={handleLinkClick}
            >
              Applications
            </NavLink>
            <NavLink
              exact
              to="/company"
              className="setst"
              activeClassName="active"
              onClick={handleLinkClick}
            >
              Company
            </NavLink>
            <NavLink
              exact
              to="/user"
              className="setst"
              activeClassName="active"
              onClick={handleLinkClick}
            >
              Users
            </NavLink>

            <NavLink
              exact
              to="/accessgroup"
              className="setst"
              activeClassName="active"
              onClick={handleLinkClick}
            >
              Access groups
            </NavLink>
          </div>
        </li>

        {/* Notification Icon */}
        <li className="setalert">
          <div className="setbell-icon-container">
            <FaBell className="setbell-icon" />
            {notifications > 0 && (
              <span className="setnotification-count">{notifications}</span>
            )}
          </div>
        </li>
        <li className="setadmin">
          <img src={admin} alt="admin" className="setadminimg" />
          <div className="setadminname">
            <p className="setad">Administrator</p>
          </div>
        </li> */}
      </ul>

      {/* Sidebar Component */}
      <div>{sidebarOpen && <Sidebar />}</div>
    </div>
  );
}