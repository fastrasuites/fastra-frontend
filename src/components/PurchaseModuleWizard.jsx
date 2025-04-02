import React from "react";
import { Modal, Box } from "@mui/material";
import { useHistory } from "react-router-dom";
import "./PurchaseModuleWizard.css";

const PurchaseModuleWizard = ({ open, onClose, step }) => {
  const history = useHistory();

  const handleAddProductandVendor = () => {
    onClose();
    if (step === 1) {
      history.push("/product", { openForm: true });
    } else if (step === 2) {
      history.push("/vendor", { openForm: true });
    } else {
      alert(" Humm! The last stage is not ready. Please use the skip button.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="modal purchase-module-wizard"
    >
      <Box className="modal-content-wrapper">
        <button className="btn-skip" onClick={onClose}>
          Skip
        </button>
        <Box sx={{ position: "relative", height: "100%" }}>
          <div className="vertical-line"></div>

          <div className="numbered-circle numbered-circle-one">{step}</div>

          <div className="numbered-circle numbered-circle-two">
            {step + 1 <= 2 ? step + 1 : ""}
          </div>
          {/* Step 1  -------------------------------- */}
          <div className="modal-main-content">
            <p className="para-headline">3 SIMPLE STEPS</p>
            <p className="heading-text">
              {step === 1
                ? "Step 1: Add Products"
                : step === 2
                ? "Step 2: Add Vendors"
                : ""}
            </p>
            <p className="para-description">
              {step === 1
                ? "Add product will ease your journey using this platform."
                : step === 2
                ? "Awesome! just few step to start having an Amazing purchase Module Experience"
                : ""}
            </p>
            <button
              onClick={handleAddProductandVendor}
              className="btn-goto-steps"
            >
              {step === 1
                ? "Add Products"
                : step === 2
                ? "Add Vendors"
                : step === 3
                ? "Start Project Creation!"
                : "You are done"}
            </button>

            {/* End Step 1 ------------------------------ */}

            {/* Step 2 ---------------------------------- */}

            {/* <p className="para-headline">3 SIMPLE STEPS</p> */}
            <p className="heading-text">
              {step === 1
                ? "Step 2: Add Vendors"
                : step === 2
                ? "Registration Successful"
                : ""}
            </p>
            <p className="para-description">
              {step === 1
                ? "Awesome! Just a few steps to start having an Amazing Fastra Experience"
                : step === 2
                ? ""
                : ""}
            </p>
          </div>
          {/* End step 2 ------------------------------ */}
        </Box>
      </Box>
    </Modal>
  );
};

// export default PurchaseModuleWizard;
