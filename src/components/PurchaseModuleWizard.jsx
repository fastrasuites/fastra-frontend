import React from "react";
import { useTenant } from "../context/TenantContext";
import { Modal, Box } from "@mui/material";
import { useHistory } from "react-router-dom";
import "./PurchaseModuleWizard.css";

const PurchaseModuleWizard = ({ open, onClose, step }) => {
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;
  const history = useHistory();

  const handleSkip = () => {
    onClose("skip"); // Special skip action
  };

  const handleStepAction = () => {
    // onClose();

    if (step === 4) {
      onClose("complete"); // Completion action
    }
    if (step === 1) {
      history.push(
        `/${tenant_schema_name}/inventory/location/create-inventory-location`,
        { openForm: true }
      );
    } else if (step === 2) {
      history.push(`/${tenant_schema_name}/product`, { openForm: true });
    } else if (step === 3) {
      history.push(`/${tenant_schema_name}/vendor`, { openForm: true });
    } else {
      onClose();
    }
  };

  // Step titles and descriptions
  const stepTitles = [
    "Step 1: Create Location",
    "Step 2: Add Products",
    "Step 3: Add Vendors",
    "Step 4: Create Purchase Request!",
    "Successful!",
  ];
  const stepDescriptions = [
    "Create a location to organize your inventory and purchases.",
    "Add products to ease your journey using this platform.",
    "Awesome! Just a few steps to start having an Amazing purchase Module Experience.",
    "Now at the last step, Enjoy seamless Experience Here.",
    "You have successfully completed the wizard!",
  ];
  const stepButtons = [
    "Create Location",
    "Add Products",
    "Add Vendors",
    "You are done",
    "",
  ];

  return (
    <Modal
      open={open}
      onClose={() => {}} // Disable backdrop closing
      className="modal purchase-module-wizard"
    >
      <Box className="modal-content-wrapper">
        <button className="btn-skip" onClick={handleSkip}>
          Skip
        </button>
        <Box sx={{ position: "relative", height: "100%" }}>
          <div className="vertical-line"></div>

          <div className="modal-main-content">
            <p className="para-headline"> SIMPLE STEPS</p>
            {/* Step 1 */}
            <Box sx={{ display: "flex", gap: "20px" }}>
              <div className="numbered-circle numbered-circle-one">{step}</div>
              <div>
                <p className="heading-text">{stepTitles[step - 1]}</p>
                <p className="para-description">{stepDescriptions[step - 1]}</p>
                <button onClick={handleStepAction} className="btn-goto-steps">
                  {stepButtons[step - 1]}
                </button>
              </div>
            </Box>

            {/* Step 2 */}
            <Box sx={{ display: "flex", gap: "20px" }}>
              <div className="numbered-circle numbered-circle-2">
                {step === 1 ? 2 : step === 2 ? 3 : step === 3 ? 4 : ""}
              </div>
              <div>
                <p className="heading-text">
                  {step === 1
                    ? stepTitles[1]
                    : step === 2
                    ? stepTitles[2]
                    : step === 3
                    ? stepTitles[3]
                    : ""}
                </p>
                <p className="para-description">
                  {step === 1
                    ? stepDescriptions[1]
                    : step === 2
                    ? stepDescriptions[2]
                    : step === 3
                    ? stepDescriptions[3]
                    : ""}
                </p>
              </div>
            </Box>

            {/* Step 3 */}
            <Box sx={{ display: "flex", gap: "20px" }}>
              <div className="numbered-circle numbered-circle-three">
                {step === 1 ? 3 : step === 2 ? 4 : ""}
              </div>
              <div>
                <p className="heading-text">
                  {step === 1 ? stepTitles[2] : step === 2 ? stepTitles[3] : ""}
                </p>
                <p className="para-description">
                  {step === 1
                    ? stepDescriptions[2]
                    : step === 2
                    ? stepDescriptions[3]
                    : ""}
                </p>
              </div>
            </Box>

            {/* Step 4 */}
            <Box sx={{ display: "flex", gap: "20px" }}>
              <div className="numbered-circle numbered-circle-four">
                {step === 1 ? 4 : ""}
              </div>
              <div>
                <p className="heading-text">
                  {step === 1 ? stepTitles[3] : ""}
                </p>
                <p className="para-description">
                  {step === 1 ? stepDescriptions[3] : ""}
                </p>
              </div>
            </Box>
          </div>
        </Box>
      </Box>
    </Modal>
  );
};

export default PurchaseModuleWizard;
