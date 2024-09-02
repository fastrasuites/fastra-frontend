import React, { useState } from "react";
import resetAvatar from "../../../image/resetImage.png";
import "./accessRight.css";
import AccessRightTabContent from "./accessRightContent/AccessRightTabContent";
import SessionsTabContent from "./accessRightContent/SessionsTabContent";
import AllowedIpTabContent from "./accessRightContent/AllowedIpTabContent";
import PreferencesTabContent from "./accessRightContent/PreferencesTabContent";
import SalesPreferenceTabContent from "./accessRightContent/SalesPreferenceTabContent";
import OutputPage from "./OutPut"; // Ensure this path is correct

// Tabs components
export const TabButtons = ({ tabsAndContent, activeTab, setActiveTab }) => {
  return (
    <div style={{ marginTop: "60px" }}>
      {tabsAndContent.map((item, index) => (
        <button
          key={item.name}
          className={`${activeTab === index ? "active" : ""} access-right-tab`}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab(index);
          }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};

const TabContent = ({
  tabsAndContent,
  activeTab,
  formData,
  setFormData,
  isEditing,
}) => {
  return (
    <section>
      {React.cloneElement(tabsAndContent[activeTab].content, {
        formData,
        setFormData,
        isEditing,
      })}
    </section>
  );
};

const AccessRight = ({ onClose }) => {
  const [formData, setFormData] = useState({
    imageFile: resetAvatar,
    name: "",
    email: "",
    accessRights: {
      HR: "",
      Sales: "",
      ProjectCosting: "",
      Project: "",
    },
    purchaseRights: {
      Right1: false,
      Right2: false,
      // Add more purchase rights as needed
    },
    sessions: [],
    allowedIPs: [],
    preferences: {},
    salesPreferences: {},
  });

  const [showOutput, setShowOutput] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const tabsAndContent = [
    {
      name: "Access rights",
      content: <AccessRightTabContent />,
    },
    {
      name: "Sessions",
      content: <SessionsTabContent />,
    },
    {
      name: "Allowed IP",
      content: <AllowedIpTabContent />,
    },
    {
      name: "Preferences",
      content: <PreferencesTabContent />,
    },
    {
      name: "Sales Preference",
      content: <SalesPreferenceTabContent />,
    },
  ];

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (files) {
      setFormData({ ...formData, imageFile: URL.createObjectURL(files[0]) });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        purchaseRights: { ...formData.purchaseRights, [name]: checked },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowOutput(true);
  };

  const handleBack = () => {
    setShowOutput(false);
  };

  if (showOutput) {
    return (
      <OutputPage
        formData={formData}
        onBack={handleBack}
        onSave={setFormData}
      />
    );
  }

  return (
    <form action="" className="newuserform">
      <div className="newuser3a">
        <p style={{ fontSize: "20px", fontWeight: "500px" }}>Access Rights</p>
        <div className="newuser3e">
          <button type="button" className="newuser3but" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            style={{ display: "flex", justifyContent: "center" }}
          >
            Save
          </button>
        </div>
      </div>

      <section className="user-detail">
        <figure className="image-figure">
          <label htmlFor="image-file">
            <img
              src={formData.imageFile}
              alt="reset avatar"
              className="reset-avatar"
            />
          </label>
          <input
            type="file"
            name="image-file"
            id="image-file"
            onChange={handleChange}
            style={{ display: "none" }}
          />
        </figure>
        <div className="name-email">
          <div className="name-input-wrapper">
            <label htmlFor="name" className="name-label">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="name-input"
            />
          </div>

          <div className="email-input-wrapper">
            <label htmlFor="email" className="email-label">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="email-input"
            />
          </div>
        </div>
      </section>
      <TabButtons
        tabsAndContent={tabsAndContent}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <TabContent tabsAndContent={tabsAndContent} activeTab={activeTab} />
    </form>
  );
};

export default AccessRight;
