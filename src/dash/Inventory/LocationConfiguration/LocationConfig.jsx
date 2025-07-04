import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Swal from "sweetalert2";
import "./LocationConfigure.css";
import { useLocationConfig } from "../../../context/Inventory/LocationConfigContext";

const LocationConfiguration = () => {
  const {
    multiLocationList,
    getMultiLocation,
    patchToggleMultiLocation,
    isLoading,
  } = useLocationConfig();

  const [isMultiLocationEnabled, setIsMultiLocationEnabled] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // 1. Load current config on mount, with loading + error handling
  useEffect(() => {
    const fetchConfig = async () => {
      setIsFetching(true);
      setFetchError("");
      try {
        await getMultiLocation();
      } catch (err) {
        console.error("Load failed:", err);
        const msg = err?.message || "Failed to load configuration.";
        setFetchError(msg);
        Swal.fire({
          icon: "error",
          title: "Load Error",
          text: msg,
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchConfig();
  }, [getMultiLocation]);

  // 2. Sync toggle state when data arrives
  useEffect(() => {
    if (multiLocationList) {
      setIsMultiLocationEnabled(!!multiLocationList.is_activated);
    }
  }, [multiLocationList]);

  // 3. Toggle handler with success/error feedback
  const handleSwitchToggle = async () => {
    if (isFetching || isLoading || !multiLocationList) return;

    const is_activated = !isMultiLocationEnabled;
    try {
      await patchToggleMultiLocation({ is_activated });
      setIsMultiLocationEnabled(is_activated);
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: `Multi‑Location ${is_activated ? "enabled" : "disabled"}.`,
      });
    } catch (err) {
      console.error("Toggle failed:", err);
      const msg = err?.response?.data?.message || "Failed to update.";
      Swal.fire({
        icon: "error",
        title: "Update Error",
        text: msg,
      });
    }
  };

  return (
    <div className="congiure-contain">
      <div className="configurations">
        <div className="configuration-header">
          <h1>Configuration</h1>
          <div className="pagination">
            <span>1-6 of 6</span>
            <div className="switch-btn">
              <button className="prev" disabled={isFetching || isLoading}>
                ◀
              </button>
              <button className="next" disabled={isFetching || isLoading}>
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
              style={{
                cursor: isFetching || isLoading ? "not-allowed" : "pointer",
              }}
            >
              <div
                className={`switch-handle ${
                  isMultiLocationEnabled ? "switch-handle-on" : ""
                }`}
              />
            </div>
          </div>
          {(isFetching || isLoading) && (
            <p className="loading">{isFetching ? "Loading…" : "Updating…"}</p>
          )}
          {fetchError && !isFetching && (
            <p className="error">Error: {fetchError}</p>
          )}
        </Box>
      </div>
    </div>
  );
};

export default LocationConfiguration;
