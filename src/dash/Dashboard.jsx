import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { FaBars, FaTimes, FaBell } from "react-icons/fa";
import SearchIcon from "../image/search.svg";
import "./Dashboard.css";
import admin from "../image/admin.svg";
import DashCard from "./DashCard";
import Sidebar from ".././components/Sidebar";
import StepModal from "../components/StepModal";
import { useTenant } from "../context/TenantContext";
import { useLocation } from "react-router-dom";
import ProfileMenuDropdown from "../components/ProfileMenuDropdown";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;

  // ---------------------------------------------------------------
  // Open and close pop modal on  following user logged in to set company account
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();
  useEffect(() => {
    // Check if the modal has been closed before
    const modalClosed = localStorage.getItem("modalClosed");
    if (location.state?.step) {
      setCurrentStep(location.state.step);
      setIsModalOpen(true);
    } else {
      if (modalClosed) {
        setIsModalOpen(false);
      } else {
        const timer = setTimeout(() => {
          setIsModalOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [location.state]);*/

  const handleCloseModal = () => {
    setIsModalOpen((prevState) => !prevState);
    localStorage.setItem("modalClosed", "true");
  };

  //End ---------------------------------------------------------------------------

  const handleSearch = () => {
    // You can perform search operations here based on the search query
    // For example, you can filter a list of items based on the search query
  };

  const toggleMenu = () => {
    setShowMenu((prevState) => !prevState);
  };

  const closeSidebar = () => {
    setShowMenu((prevState) => !prevState);
  };

  return (
    <div id="dashboard" className="dash">
      <div className="dashhead">
        <ul className="headwrap">
          <li className="hom" onClick={toggleMenu}>
            {showMenu ? (
              <FaTimes className="dashnav" />
            ) : (
              <FaBars className="dashnav" />
            )}
            <p>Home</p>
          </li>
          <li className="sash">
            <div className="sashtag">
              <label
                htmlFor="searchInput"
                className="sarch"
                onClick={handleSearch}
              >
                <img src={SearchIcon} alt="Search" className="sashnav" />
                <input
                  id="searchInput"
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sashput"
                />
              </label>
            </div>
          </li>
          <li className="alert">
            <div className="bell-icon-container">
              <FaBell className="bell-icon" />
              {notifications > 0 && (
                <span className="notification-count">{notifications}</span>
              )}
            </div>
          </li>
          <ProfileMenuDropdown />
          {/* <li className="admin">
            <img src={admin} alt="admin" className="adminimg" />
            <div className="adminname">
              <p className="ad1">Administrator</p>
              <p className="ad2">info@companyname.com</p>
            </div>
          </li> */}
        </ul>
      </div>
      {showMenu && (
        <Sidebar sidebarOpen={showMenu} handleCloseSidebar={closeSidebar} />
      )}
      {/*  */}

      <div className="dashbody">
        <div className="bocard">
          <DashCard />
        </div>
      </div>

      {/* controls the Step modal following user logged in to set up company account */}
      {/*<StepModal
        open={isModalOpen}
        onClose={handleCloseModal}
        step={currentStep}
      />
    </div>
  );
}
