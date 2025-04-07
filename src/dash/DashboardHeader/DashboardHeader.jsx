import React, { useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaBell } from "react-icons/fa6";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import Sidebar from "../../components/Sidebar";
import ProfileMenuDropdown from "../../components/ProfileMenuDropdown";
import "./DashboardHeader.css";

const DashboardHeader = ({ title, menuItems }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleDropdownToggle = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const toggleSidebar = () => {
    console.log("i was opened");
    setIsSidebarOpen((prevState) => !prevState);
  };

  const closeSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
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
          <nav className="nav">
            {menuItems.map((item, index) => (
              <div key={index} className="navItem">
                <Link
                  to={item.link} // Use Link instead of a href
                  onClick={(e) => {
                    if (item.subItems) {
                      e.preventDefault();
                      handleDropdownToggle(index);
                    }
                  }}
                  className={`${
                    item.subItems ? "navLinkWithArrow navLink" : "navLink"
                  }`}
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
                        to={subItem.link} // Use Link for subItems as well
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
        </div>
        <div className="rightSection">
          <div className="notification-icon">
            <span className="strokeRight" />
            <button className="notification">
              <FaBell />
            </button>
            <span className="strokeRight" />
          </div>
          {/* administrator profile */}
          <ProfileMenuDropdown
            isOpen={isProfileMenuOpen}
            onClose={closeProfileMenu}
          />
        </div>
      </header>

      {/* Conditionally render the Sidebar */}
      <Sidebar sidebarOpen={isSidebarOpen} handleCloseSidebar={closeSidebar} />
    </div>
  );
};

export default DashboardHeader;
