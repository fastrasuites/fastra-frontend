import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { useTenant } from "../context/TenantContext";
import { useHistory } from "react-router-dom";
import "./stepModal.css";

const StepModal = ({ open, onClose, step, onNextStep }) => {
  /*const history = useHistory();
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;

  const handleSetUpCompany = () => {
    onClose();
    if (step === 1) {
      history.push(`/${tenant_schema_name}/company`, { openForm: true, step });
    } else if (step === 2) {
      history.push("/user", { openForm: true, step });
    } else {
      alert(" Humm! The last stage is not ready. Please use the skip button.");
    }
  };*/

  return (
    <Modal open={open} onClose={onClose} className="modal">
      <Box className="modal-content-wrapper">
        <button className="btn-skip" onClick={onClose}>
          Skip
        </button>
        <Box sx={{ position: "relative", height: "100%" }}>
          <div className="vertical-line"></div>

          <div className="numbered-circle numbered-circle-one">{step}</div>

          <div className="numbered-circle numbered-circle-two">
            {step + 1 <= 3 ? step + 1 : ""}
          </div>
          {/* Step 1  -------------------------------- */}
          <div className="modal-main-content">
            <p className="para-headline">3 SIMPLE STEPS</p>
            <p className="heading-text">
              {step === 1
                ? "Step 1: Company Setting"
                : step === 2
                ? "Step 2: User Creation"
                : step === 3
                ? "step 3: Project Creation"
                : "Registration Successful"}
            </p>
            <p className="para-description">
              {step === 1
                ? "A company set-up will ease your journey using this platform."
                : step === 2
                ? "Awesome! Just a few steps to start having an Amazing Fastra Experience"
                : step === 3
                ? "Now at the last step, Enjoy seamless Experience Here."
                : ""}
            </p>
            <button onClick={onNextStep} className="btn-goto-steps">
              {step === 1
                ? "Set up your Company!"
                : step === 2
                ? "Start User Creation!"
                : step === 3
                ? "Start Project Creation!"
                : "You are done"}
            </button>

            {/* End Step 1 ------------------------------ */}

            {/* Step 2 ---------------------------------- */}

            <p className="para-headline">3 SIMPLE STEPS</p>
            <p className="heading-text">
              {step === 1
                ? "Step 2: User Creation"
                : step === 2
                ? "step 3: Project Creation"
                : "Registration Successful"}
            </p>
            <p className="para-description">
              {step === 1
                ? "Awesome! Just a few steps to start having an Amazing Fastra Experience"
                : step === 2
                ? "Now at the last step, Enjoy seamless Experience Here."
                : ""}
            </p>
          </div>
          {/* End step 2 ------------------------------ */}
        </Box>
      </Box>
    </Modal>
  );
};

export default StepModal;
