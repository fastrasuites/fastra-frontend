import React, { useState, useEffect, useMemo} from "react";
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
import { getTenantClient } from "../services/apiService";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  

  const { tenantData, updateTenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const access_token = useTenant().tenantData.access_token;
  const refresh_token = useTenant().tenantData.refresh_token;

  const history = useHistory();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);

  const client = useMemo(
    () =>
      tenant_schema_name && access_token && refresh_token
        ? getTenantClient(tenant_schema_name, access_token, refresh_token)
        : null,
    [tenant_schema_name, access_token, refresh_token]
  );

  /*useEffect(() => {
    const currentStep = parseInt(localStorage.getItem("onboardingStep") || "0");
  
    const alreadyFromStepModal = localStorage.getItem("fromStepModals");
    if (!tenantData.isOnboarded && !showModal && !alreadyFromStepModal) {
      setStep(currentStep + 1);
      setShowModal(true);
      localStorage.setItem("fromStepModals", "true");
    }
  }, [tenantData.isOnboarded, showModal]);*/



  useEffect(() => {
    const currentStep = parseInt(localStorage.getItem("onboardingStep") || "0");
    const alreadyFromStepModal = localStorage.getItem("fromStepModals");

    if (
        typeof tenantData.isOnboarded === "boolean" &&
        !tenantData.isOnboarded //&& !alreadyFromStepModal
    ) {
        console.log("Triggering onboarding modal");
        setStep(currentStep + 1);
        setShowModal(true);
        localStorage.setItem("fromStepModals", "true");
    }
}, [tenantData.isOnboarded]);


useEffect(() => {
  console.log({
      showModal,
      isOnboarded: tenantData.isOnboarded,
      onboardingStep: localStorage.getItem("onboardingStep"),
      fromStepModals: localStorage.getItem("fromStepModals"),
  });
}, [tenantData.isOnboarded, showModal]);



  const handleNextStep = async() => {
    setShowModal(false);
    if (step === 1) {
      localStorage.setItem("onboardingStep", "1");
      history.push(`/${tenant_schema_name}/settings/company/new`, {
        fromStepModals: true,
      });
      /*localStorage.setItem("fromStepModals", "true");*/
    } else if (step === 2) {
      console.log("Routing to accessgroups/new");
      localStorage.setItem("onboardingStep", "2");
      history.push(`/${tenant_schema_name}/settings/accessgroups/new`, {
        fromStepModals: true,
      });
      /*localStorage.setItem("fromStepModals", "true");*/
    } else if (step === 3) {
      console.log("Completing onboarding, routing to user/new");
      localStorage.setItem("onboardingStep", "3");
        try {
          await completeOnboarding();
          console.log("Onboarding completed successfully.");
      } catch (error) {
          console.error("Error completing onboarding:", error);
      }
      console.log("Tenant Schema Name: ", tenant_schema_name);
      history.push(`/${tenant_schema_name}/settings/user/new`, {
        fromStepModals: true,
      });
    }
  };
  /** 
   *   NEW: make a request to the backend to update is Onboarded value 
  */
  const completeOnboarding = async () => {
    if (!client) {
        console.error("Client not ready, cannot complete onboarding.");
        return;
    }
    try {
        const response = await client.patch("/company/mark-onboarded/", {
            is_onboarded: true,
        });
        console.log("Onboarding completed:", response.data);
        // Fetch fresh backend state for confirmation and update local tenantData
        await fetchTenantDetailsAndUpdate();
        // Optional:
        // updateTenantData({ ...tenantData, is_onboarded: true });
        return response.data;
    } catch (error) {
        console.error("Error completing onboarding:", error);
        throw error;
    }
  };

  /**
   * NEW: fetches the new value of isOnboarded
   * @returns either true or false based on the current value of is_onboarded  
   */
  const fetchTenantDetailsAndUpdate = async () => {
    try {
        if (!client) {
            console.error("Client not initialized, skipping tenant details fetch.");
            return;
        }
        const response = await client.get("/company/onboarding-status/"); 
        const data = response.data;

        if (data && typeof data.is_onboarded !== "undefined") {
            updateTenantData({ isOnboarded: data.is_onboarded });
        }
    } catch (error) {
        console.error("Error fetching tenant details:", error);
    }
};


const handleSkipOnboarding = async (actionSource) => {
  setShowModal(false);

  // Mark onboarding as completed in local storage
  localStorage.setItem("onboardingStep", "3");
  localStorage.removeItem("fromStepModals");

  // If skip originated from onboarding context, complete backend onboarding
  if (actionSource === "onboarding") {
    try {
      await completeOnboarding();
    } catch (error) {
      console.error("Error completing onboarding during skip:", error);
    }
  }
};

  /*const handleSkip = async () => {
    setShowModal(false);
    localStorage.setItem("onboardingStep", "3");
    await completeOnboarding()
  };*/

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
        onClose={() => handleSkipOnboarding("onboarding")}
        step={step}
        onNextStep={handleNextStep}
      />

      {/*<button
          onClick={completeOnboarding()}
          style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              padding: "10px 16px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              zIndex: 1000,
          }}
      >
          Complete Onboarding (Test)
      </button>*/}

    </div>
  );
}
