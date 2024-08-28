import React, { useState } from "react";
import { FaBars, FaTimes, FaBell } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import admin from "../../image/admin.svg";
import Sidebar from "../../components/Sidebar";
import "./sethead.css";
import ProfileMenuDropdown from "../../components/ProfileMenuDropdown";

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

  return (
    <div className="sethead">
      <ul className="setwrap">
        <li className="sethom" onClick={toggleSidebar}>
          {sidebarOpen ? (
            <FaTimes className="setnav" />
          ) : (
            <FaBars className="setnav" />
          )}
          <p style={{ fontWeight: "700" }}>Settings</p>
        </li>
        <li className="setlst">
          <div className="setlist">
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
          </div>
        </li>
        <li className="setalert">
          <div className="setbell-icon-container">
            <FaBell className="setbell-icon" />
            {notifications > 0 && (
              <span className="setnotification-count">{notifications}</span>
            )}
          </div>
        </li>
        <ProfileMenuDropdown />
        {/* <li className="setadmin">
          <img src={admin} alt="admin" className="setadminimg" />
          <div className="setadminname">
            <p className="setad">Administrator</p>
          </div>
        </li> */}
      </ul>
      {sidebarOpen && <Sidebar />}
    </div>
  );
}
