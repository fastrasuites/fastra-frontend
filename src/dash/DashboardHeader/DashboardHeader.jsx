import React, { useState, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaBell } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ProfileMenuDropdown from "../../components/ProfileMenuDropdown";
import "./DashboardHeader.css";

const DashboardHeader = ({ title, menuItems }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen((prev) => !prev);
  };

  const handleDropdownToggle = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  return (
    <div className="dash-Head">
      <header className="header">
        <div className="leftSection">
          <button className="menuButton" onClick={toggleSidebar}>
            ☰
          </button>
          <h1 className="title">{title}</h1>
          <span className="strokeRight" />
        </div>

        {/* Hamburger for mobile nav (not sidebar) */}
        <button className="mobileNavToggle" onClick={toggleMobileNav}>
          ☰
        </button>

        <nav className={`nav ${isMobileNavOpen ? "open" : ""}`}>
          {menuItems.map((item, index) => (
            <div key={index} className="navItem">
              <Link
                to={item.link}
                onClick={(e) => {
                  if (item.subItems) {
                    e.preventDefault();
                    handleDropdownToggle(index);
                  }
                }}
                className={`navLink ${item.subItems ? "navLinkWithArrow" : ""}`}
              >
                {item.label}
                {item.subItems && (
                  <RiArrowDropDownLine
                    style={{
                      marginLeft: "5px",
                      fontSize: "1.5rem",
                      transform:
                        activeDropdown === index
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                )}
              </Link>
              {item.subItems && activeDropdown === index && (
                <div className="dropdown">
                  {item.subItems.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.link}
                      className="dropdownItem"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="rightSection">
          <span className="strokeRight" />
          <button className="notification">
            <FaBell />
          </button>
          <span className="strokeRight" />
          <ProfileMenuDropdown
            isOpen={isProfileMenuOpen}
            onClose={() => setIsProfileMenuOpen(false)}
          />
        </div>
      </header>

      <Sidebar
        sidebarOpen={isSidebarOpen}
        handleCloseSidebar={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

export default DashboardHeader;
