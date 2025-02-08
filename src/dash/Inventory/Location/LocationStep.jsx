import React from "react";
import { Modal, Box } from "@mui/material";
import { useHistory } from "react-router-dom";
import "./LocationStep.css";

const LocationStep = ({ open, onClose, step }) => {
  const history = useHistory();

  const handleLocationSetUp = () => {
    onClose();
    if (step === 1) {
      history.push("/create-inventory-location");
    } else {
      alert("Humm! The last stage is not ready. Please use the skip button.");
    }
  };
  

  return (
    <Modal open={open} onClose={onClose} className="modal">
      <Box className="modal-content-wrapper">
        <button className="btn-skip" onClick={onClose}>
          Skip
        </button>
        <Box sx={{ position: "relative", height: "100%" }}>
          <div className="vertical-line"></div>

          <div className="modal-main-content">
            <p className="heading-text"> Location Creation</p>
            <p className="para-description"> To proceed, kindly create your location </p>
            <button onClick={handleLocationSetUp} className="btn-goto-steps"> Create Location </button>
            
          </div>
        </Box>
      </Box>
    </Modal>
  );
};

export default LocationStep;
