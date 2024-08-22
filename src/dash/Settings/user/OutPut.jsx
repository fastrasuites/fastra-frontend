import React, { useState } from "react";
import "./OutputPage.css";

const TabButtons = ({ tabsAndContent, activeTab, setActiveTab }) => {
  return (
    <div className="tabs-container">
      {tabsAndContent.map((item, index) => (
        <button
          key={item.name}
          className={`access-right-tab ${activeTab === index ? "active" : ""}`}
          onClick={() => setActiveTab(index)}
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
  if (activeTab === 0) {
    return (
      <div className="tab-content">
        <h3>Application Accesses</h3>
        <table className="application-accesses">
          <tbody>
            {Object.entries(formData.accessRights || {}).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      name={key}
                      value={value || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accessRights: {
                            ...formData.accessRights,
                            [key]: e.target.value,
                          },
                        })
                      }
                    />
                  ) : (
                    value || ""
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Purchase Rights</h3>
        <div className="purchase-rights">
          {Object.entries(formData.purchaseRights || {}).map(([key, value]) => (
            <div key={key} className="purchase-right-item">
              <label>
                {key}
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchaseRights: {
                          ...formData.purchaseRights,
                          [key]: e.target.checked,
                        },
                      })
                    }
                  />
                ) : (
                  <input type="checkbox" checked={value} readOnly />
                )}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="tab-content">{tabsAndContent[activeTab].name} content</div>
  );
};

const OutputPage = ({ formData, onBack, onSave }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const tabsAndContent = [
    { name: "Access Rights" },
    { name: "Sessions" },
    { name: "Allowed IP" },
    { name: "Preferences" },
    { name: "Sales Preference" },
  ];

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    onSave(formData); // Save changes made in the edit mode
  };

  return (
    <div className="settings-container">
      <main className="access-rights-content">
        <div className="access-rights-header">
          <h2>Access Rights</h2>
          <div className="action-buttons">
            <button className="cancel-button" onClick={onBack}>
              Cancel
            </button>
            {isEditing ? (
              <button className="save-button" onClick={handleSaveClick}>
                Save
              </button>
            ) : (
              <button className="edit-button" onClick={handleEditClick}>
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="user-info">
          <img
            src={formData.imageFile}
            alt="User avatar"
            className="user-avatar"
          />
          <div className="user-details">
            <p className="user-name">{formData.name}</p>
            <p className="user-email">{formData.email}</p>
          </div>
        </div>

        <TabButtons
          tabsAndContent={tabsAndContent}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <TabContent
          tabsAndContent={tabsAndContent}
          activeTab={activeTab}
          formData={formData}
          setFormData={onSave} // Pass onSave to allow updating formData
          isEditing={isEditing}
        />
      </main>
    </div>
  );
};

export default OutputPage;
