import React, { useState, useEffect } from "react";
import "./LocationConfigure.css";

const ConfigurationPage = () => {
  const [isMultiLocationEnabled, setIsMultiLocationEnabled] = useState(false);

  useEffect(() => {
    // Retrieve the initial state from localStorage or set default to false
    const savedMultiLocationStatus = JSON.parse(localStorage.getItem('multiLocationEnabled'));
    setIsMultiLocationEnabled(savedMultiLocationStatus || false);
  }, []);

  const handleSwitchToggle = () => {
    const newStatus = !isMultiLocationEnabled;
    setIsMultiLocationEnabled(newStatus);
    localStorage.setItem('multiLocationEnabled', JSON.stringify(newStatus));
  };

  return (
    <div className="configuration-page">
      <h2>Configuration Page</h2>
      
      <div className="switch-container">
        <label className="switch-label">Enable Multi-Location</label>
        <div
          className={`switch ${isMultiLocationEnabled ? "switch-on" : "switch-off"}`}
          onClick={handleSwitchToggle}
        >
          <div className={`switch-handle ${isMultiLocationEnabled ? "switch-handle-on" : ""}`} />
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPage;
