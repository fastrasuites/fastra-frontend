import { useState } from "react";
import { FaBars, FaBell } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ProfileMenuDropdown from "../../components/ProfileMenuDropdown";
import "./sethead.css";
import { MdSettingsApplications } from "react-icons/md";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useTenant } from "../../context/TenantContext";

export default function SetHead() {
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [showMenu, setShowMenu] = useState(0);

  const handleLinkClick = () => {
    setShowMenu(false);
  };

  const handleOpenSidebar = () => {
    console.log("clicked to open sidebar from settings header");
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    console.log("clicked to close sidebar");
    setSidebarOpen(false);
  };

  // responsiveness menu toggle
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuVisible(!isMenuVisible); // Toggle the visibility
  };
  const handleMenuItemClick = () => {
    setIsMenuVisible(false); // Collapse the menu when an item is clicked
  };

  return (
    <div className="settings-header">
      <ul className="settings-header__wrapper">
        <li className="settings-header__home">
          <FaBars
            className="settings-header__menu-icon"
            onClick={handleOpenSidebar}
            style={{ cursor: "pointer" }}
          />
          <p className="settings-header__title" onClick={handleMenuToggle}>
            <MdSettingsApplications className="menu" />
            Settings
            <RiArrowDropDownLine
              className="menu"
              style={{ fontSize: "27px" }}
            />{" "}
          </p>
        </li>
        <li
          className={`settings-header__navigation ${
            isMenuVisible ? "show" : ""
          }`}
        >
          <div className="settings-header__nav-links">
            <NavLink
              exact
              to={`/${tenant_schema_name}/apk`}
              className="settings-header__link"
              activeClassName="settings-header__link--active"
              onClick={handleMenuItemClick}
            >
              Applications
            </NavLink>
            <NavLink
              exact
              to={`/${tenant_schema_name}/company`}
              className="settings-header__link"
              activeClassName="settings-header__link--active"
              onClick={handleMenuItemClick}
            >
              Company
            </NavLink>
            <NavLink
              exact
              to={`/${tenant_schema_name}/user`}
              className="settings-header__link"
              activeClassName="settings-header__link--active"
              onClick={handleMenuItemClick}
            >
              Users
            </NavLink>
            <NavLink
              exact
              to={`/${tenant_schema_name}/accessgroups`}
              className="settings-header__link"
              activeClassName="settings-header__link--active"
              onClick={handleMenuItemClick}
            >
              Access Groups
            </NavLink>
          </div>
        </li>
        <li className="settings-header__notifications">
          <div className="settings-header__bell-icon-container">
            <FaBell className="settings-header__bell-icon" />
            {notifications > 0 && (
              <span className="settings-header__notification-count">
                {notifications}
              </span>
            )}
          </div>
        </li>
        <ProfileMenuDropdown />
      </ul>
      <Sidebar
        sidebarOpen={sidebarOpen}
        handleCloseSidebar={handleCloseSidebar}
      />
    </div>
  );
}
