import React from "react";
// import { useTenant } from "../context/TenantContext";
import { Modal, Box, Typography, Button } from "@mui/material";
// import { useHistory } from "react-router-dom";
// import "./stepModal.css";
import "./PurchaseModuleWizard.css";

const StepModal = ({ open, onClose, step, onNextStep }) => {
  // const history = useHistory();
  // const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;

  //const handleSetUpCompany = () => {

   // return;
    // onClose();
    // if (step === 1) {
    //   history.push(`/${tenant_schema_name}/company`, { openForm: true });
    // } else if (step === 2) {
    //   history.push(`/${tenant_schema_name}/user`, { openForm: true });
    // } else {
    //   alert(" Humm! The last stage is not ready. Please use the skip button.");
    // }
  //};

  return (
    <Modal open={open} onClose={onClose} className="modal">
      <Box className="modal-content-wrapper">
        <button className="btn-skip" onClick={onClose}>
          Skip
        </button>
        <Box sx={{ position: "relative", height: "100%" }}>
          <div className="vertical-line"></div>

          {/* Step 1  -------------------------------- */}
          <div className="modal-main-content">
            <Box sx={{ display: "flex", gap: "20px" }}>
              <div className="numbered-circle numbered-circle-one">{step}</div>
              <div>
                <p className="para-headline">3 SIMPLE STEPS</p>
                <p className="heading-text">
                  {step === 1
                    ? "Step 1: Company Setting"
                    : step === 2
                    ? "Step 2: Access Right Creation"
                    : step === 3
                    ? "step 3: User Creation"
                    : "Registration Successful"}
                </p>
                <p className="para-description">
                  {step === 1
                    ? "A company set-up will ease your journey using this platform."
                    : step === 2
                    ? "Awesome! Just a few steps to start having an Amazing Fastra Experience"
                    : step === 3
                    ? "Now at the last step, Enjoy seamless Experience Here."
                    : "You have successfully completed the wizard!"}
                </p>
                <button onClick={onNextStep} className="btn-goto-steps">
                  {step === 1
                    ? "Set up your Company!"
                    : step === 2
                    ? "Start Access Right Creation!"
                    : step === 3
                    ? "Start User Creation!"
                    : "You are done"}
                </button>
              </div>
            </Box>

            {/* End Step 1 ------------------------------ */}

            {/* Step 2 ---------------------------------- */}
            <Box sx={{ display: "flex", gap: "20px" }}>
              <div className="numbered-circle numbered-circle-2">
                {step === 1 ? step + 1 : step === 2 ? step + 1 : ""}
              </div>
              <div>
                <p className="heading-text">
                  {step === 1
                    ? "Step 2: Access Right Creation"
                    : step === 2
                    ? "Step 3: User Creation"
                    : "Registration Successful"}
                </p>
                <p className="para-description">
                  {step === 1
                    ? "Awesome! Just a few steps to start having an Amazing Fastra Experience"
                    : step === 2
                    ? "The next step, Enjoy seamless Experience Here."
                    : ""}
                </p>
              </div>
            </Box>

            {/* Step 3 start here ---------------------------------- */}

            <Box sx={{ display: "flex", gap: "20px" }}>
              <div className="numbered-circle numbered-circle-three">
                {step === 1 ? step + 2 : ""}
              </div>
              <div>
                <p className="heading-text">
                  {step === 1
                    ? "Step 3: Start User Creation!"
                    : step === 2
                    ? ""
                    : ""}
                </p>
                <p className="para-description">
                  {step === 1
                    ? "Now at the last step, Enjoy seamless Experience Here"
                    : step === 2
                    ? ""
                    : ""}
                </p>
              </div>
            </Box>
          </div>
          {/* End step 2 ------------------------------ */}
        </Box>
      </Box>
    </Modal>
  );
};

export default StepModal;
