import React from "react";
import { Modal, Box } from "@mui/material";
import { useHistory } from "react-router-dom";
import "./LocationStep.css";

const LocationStep = ({ open, onClose, step }) => {
  const history = useHistory();

  const handleSetUpCompany = () => {
    onClose();
    if (step === 1) {
      history.push("/company", { openForm: true });
    } else if (step === 2) {
      history.push("/user", { openForm: true });
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
        <Box className="modal-content">
          <div className="vertical-line"></div>
          <div className="modal-text-content">
            <h2 className="title">Location Creation</h2>
            <p className="description">To proceed, kindly create your Location.</p>
            <button onClick={handleSetUpCompany} className="btn-create-location">
              Create Location
            </button>
          </div>
        </Box>
      </Box>
    </Modal>
  );
};

export default LocationStep;
