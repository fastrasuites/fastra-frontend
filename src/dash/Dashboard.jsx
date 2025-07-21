import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaBell } from "react-icons/fa";
import SearchIcon from "../image/search.svg";
import "./Dashboard.css";
import admin from "../image/admin.svg";
import { useTenant } from "../context/TenantContext";
import DashCard from "./DashCard";
import Sidebar from "../components/Sidebar";
import StepModal from "../components/StepModal";
import { useHistory } from "react-router-dom";
import ProfileMenuDropdown from "../components/ProfileMenuDropdown";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  const history = useHistory();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Ensure the value is initialized to 'false' if not set
    if (localStorage.getItem("onboardingCompleted") === null) {
      localStorage.setItem("onboardingCompleted", "false");
    }

    const onboardingCompleted =
      localStorage.getItem("onboardingCompleted") === "true";
    const currentStep = parseInt(localStorage.getItem("onboardingStep") || "0");

    if (!onboardingCompleted) {
      localStorage.setItem("fromStepModal", "true");
      setStep(currentStep + 1); // ensures step = 1 if onboardingStep = 0
      setShowModal(true);
    }
  }, []);

  const handleNextStep = () => {
    setShowModal(false);
    if (step === 1) {
      localStorage.setItem("onboardingStep", "1");
      history.push(`/${tenant_schema_name}/settings/company/new`, {
        fromStepModal: true,
      });
      localStorage.setItem("fromStepModal", "true");
    } else if (step === 2) {
      localStorage.setItem("onboardingStep", "2");
      history.push(`/${tenant_schema_name}/settings/accessgroups/new`, {
        fromStepModal: true,
      });
      localStorage.setItem("fromStepModal", "true");
    } else if (step === 3) {
      localStorage.setItem("onboardingStep", "3");
      localStorage.setItem("onboardingCompleted", "true");
      history.push(`/${tenant_schema_name}/settings/user/new`, {
        fromStepModal: true,
      });
    }
  };

  const handleSkip = () => {
    setShowModal(false);
    localStorage.setItem("onboardingStep", "3");
    localStorage.setItem("onboardingCompleted", "true");
  };

  const handleSearch = () => {};

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  const closeSidebar = () => {
    setShowMenu((prev) => !prev);
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
        </ul>
      </div>

      {showMenu && (
        <Sidebar sidebarOpen={showMenu} handleCloseSidebar={closeSidebar} />
      )}

      <div className="dashbody">
        <div className="bocard">
          <DashCard />
        </div>
      </div>

      <StepModal
        open={showModal}
        onClose={handleSkip}
        step={step}
        onNextStep={handleNextStep}
      />
    </div>
  );
}
