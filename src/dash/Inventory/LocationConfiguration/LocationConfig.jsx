import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import "./LocationConfigure.css";
import { useLocationConfig } from "../../../context/Inventory/LocationConfigContext";
import { extractId } from "../../../helper/helper";

const LocationConfiguration = () => {
  const {
    multiLocationList,
    getMultiLocation,
    patchToggleMultiLocation,
    isLoading,
    error,
  } = useLocationConfig();

  const [isMultiLocationEnabled, setIsMultiLocationEnabled] = useState(false);
  // const [isMultiLocationEnabled, setIsMultiLocationEnabled] = useState(true);

  useEffect(() => {
    getMultiLocation();
  }, [getMultiLocation]);

  useEffect(() => {
    if (multiLocationList) {
      setIsMultiLocationEnabled(multiLocationList?.is_activated);
    }
  }, [multiLocationList]);

  // 3. Toggle handler
  const handleSwitchToggle = async () => {
    if (isLoading || multiLocationList.length === 0) return;

    const is_activated = !isMultiLocationEnabled;
    // const id = extractId(multiLocationList[0].url);

    try {
      await patchToggleMultiLocation({ is_activated });

      setIsMultiLocationEnabled(is_activated);
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  console.log(isMultiLocationEnabled, "isMultiLocationEnabled");
  return (
    <div className="congiure-contain">
      <div className="configurations">
        <div className="configuration-header">
          <h1>Configuration</h1>
          <div className="pagination">
            <span>1-6 of 6</span>
            <div className="switch-btn">
              <button className="prev" disabled={isLoading}>
                ◀
              </button>
              <button className="next" disabled={isLoading}>
                ▶
              </button>
            </div>
          </div>
        </div>

        <Box component="form" className="configuration-form">
          <h3>Multi Location</h3>
          <hr /> <br /> <br />
          <div className="switch-container">
            <h3>Activate Multi Location</h3>
            <div
              className={`switch ${
                isMultiLocationEnabled ? "switch-on" : "switch-off"
              }`}
              onClick={handleSwitchToggle}
              style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
            >
              <div
                className={`switch-handle ${
                  isMultiLocationEnabled ? "switch-handle-on" : ""
                }`}
              />
            </div>
          </div>
          {/* {isLoading && <p className="loading">Updating…</p>}
          {error && <p className="error">Error updating status</p>} */}
        </Box>
      </div>
    </div>
  );
};

export default LocationConfiguration;
