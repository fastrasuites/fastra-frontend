import React, { useState } from "react";
import resetAvatar from "../../../image/resetImage.png";
import "./accessRight.css";
import AccessRightTabContent from "./accessRightContent/AccessRightTabContent";
import SessionsTabContent from "./accessRightContent/SessionsTabContent";
import AllowedIpTabContent from "./accessRightContent/AllowedIpTabContent";
import PreferencesTabContent from "./accessRightContent/PreferencesTabContent";
import SalesPreferenceTabContent from "./accessRightContent/SalesPreferenceTabContent";
<<<<<<< HEAD
import OutputPage from "./OutPut";

=======

// Tabs components
>>>>>>> 39b8b530684ba80709355ee0e96fcd29a95d4bc7
export const TabButtons = ({ tabsAndContent, activeTab, setActiveTab }) => {
  return (
    <div style={{ marginTop: "60px" }}>
      {tabsAndContent.map((item, index) => (
        <button
          key={item.name}
<<<<<<< HEAD
          className={`${activeTab === index ? "active" : ""} access-right-tab`}
=======
          className={`${activeTab === index && "active"} access-right-tab`}
>>>>>>> 39b8b530684ba80709355ee0e96fcd29a95d4bc7
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

<<<<<<< HEAD
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

=======
const TabContent = ({ tabsAndContent, activeTab }) => {
  return <section>{tabsAndContent[activeTab].content}</section>;
};

const AccessRight = ({ handleSubmit, onClose }) => {
>>>>>>> 39b8b530684ba80709355ee0e96fcd29a95d4bc7
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

<<<<<<< HEAD
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
    <form onSubmit={handleSubmit} className="newuserform">
      <div className="newuser3a">
        <p style={{ fontSize: "20px", fontWeight: "500" }}>Access Rights</p>
=======
  const [imageFile, setImageFile] = useState(null);
  const handleChange = (e) => {
    console.log(e.target.files);
    setImageFile(URL.createObjectURL(e.target.files[0]));
  };

  const [activeTab, setActiveTab] = useState(0);
  return (
    <form action="" className="newuserform">
      <div className="newuser3a">
        <p style={{ fontSize: "20px", fontWeight: "500px" }}>Access Rights</p>
>>>>>>> 39b8b530684ba80709355ee0e96fcd29a95d4bc7
        <div className="newuser3e">
          <button type="button" className="newuser3but" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="newuser3btn"
            style={{ display: "flex", justifyContent: "center" }}
          >
            Save
          </button>
        </div>
      </div>
<<<<<<< HEAD
=======

>>>>>>> 39b8b530684ba80709355ee0e96fcd29a95d4bc7
      <section className="user-detail">
        <figure className="image-figure">
          <label htmlFor="image-file">
            <img
<<<<<<< HEAD
              src={formData.imageFile}
              alt="reset avatar"
=======
              src={imageFile}
              alt="reset avatar"
              id=""
>>>>>>> 39b8b530684ba80709355ee0e96fcd29a95d4bc7
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
<<<<<<< HEAD
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="name-input"
            />
          </div>
=======
            <input type="text" className="name-input" />
          </div>

>>>>>>> 39b8b530684ba80709355ee0e96fcd29a95d4bc7
          <div className="email-input-wrapper">
            <label htmlFor="email" className="email-label">
              Email
            </label>
            <input
              type="email"
              name="email"
<<<<<<< HEAD
              value={formData.email}
              onChange={handleChange}
=======
              id="email"
>>>>>>> 39b8b530684ba80709355ee0e96fcd29a95d4bc7
              className="email-input"
            />
          </div>
        </div>
      </section>
<<<<<<< HEAD
=======

>>>>>>> 39b8b530684ba80709355ee0e96fcd29a95d4bc7
      <TabButtons
        tabsAndContent={tabsAndContent}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
<<<<<<< HEAD
      <TabContent
        tabsAndContent={tabsAndContent}
        activeTab={activeTab}
        formData={formData}
        setFormData={setFormData}
        isEditing={false}
      />
=======
      <TabContent tabsAndContent={tabsAndContent} activeTab={activeTab} />
>>>>>>> 39b8b530684ba80709355ee0e96fcd29a95d4bc7
    </form>
  );
};

export default AccessRight;
