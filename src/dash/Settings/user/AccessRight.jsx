import React, { useState } from "react";
import resetAvatar from "../../../image/resetImage.png";
import "./accessRight.css";
import AccessRightTabContent from "./accessRightContent/AccessRightTabContent";
import SessionsTabContent from "./accessRightContent/SessionsTabContent";
import AllowedIpTabContent from "./accessRightContent/AllowedIpTabContent";
import PreferencesTabContent from "./accessRightContent/PreferencesTabContent";
import SalesPreferenceTabContent from "./accessRightContent/SalesPreferenceTabContent";

// Tabs components
export const TabButtons = ({ tabsAndContent, activeTab, setActiveTab }) => {
  return (
    <div style={{ marginTop: "60px" }}>
      {tabsAndContent.map((item, index) => (
        <button
          key={item.name}
          className={`${activeTab === index && "active"} access-right-tab`}
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

const TabContent = ({ tabsAndContent, activeTab }) => {
  return <section>{tabsAndContent[activeTab].content}</section>;
};

const AccessRight = ({ handleSubmit, onClose }) => {
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

  const [imageFile, setImageFile] = useState(null);
  const handleChange = (e) => {
    console.log(e.target.files);
    setImageFile(URL.createObjectURL(e.target.files[0]));
  };

  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="registration-form">
       <form className="registration-info" onSubmit={handleSubmit}>
       <div className="registration-header-info">
        <h2 style={{ fontSize: "20px", fontWeight: "500px" }}>Access Rights</h2>
        <div className="reg-action-btn">
          <button type="button" className="cancel-btn" onClick={onClose}>
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

      <section className="registration-basic-info">
        <figure className="image-figure">
          <label htmlFor="image-file">
            <img
              src={imageFile}
              alt="reset avatar"
              id=""
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
            <input type="text" className="name-input" />
          </div>
          <div className="email-input-wrapper" style={{marginTop: "10px"}}>
            <label htmlFor="email" className="email-label">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
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
    </div>
  );
};

export default AccessRight;
