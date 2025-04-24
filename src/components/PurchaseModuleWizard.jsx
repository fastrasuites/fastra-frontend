import React from "react";
import { useTenant } from "../context/TenantContext";
import { Modal, Box } from "@mui/material";
import { useHistory } from "react-router-dom";
import "./PurchaseModuleWizard.css";

const PurchaseModuleWizard = ({ open, onClose, step }) => {
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;
  const history = useHistory();

  const handleAddProductandVendor = () => {
    onClose();
    if (step === 1) {
      history.push(`/${tenant_schema_name}/product`, { openForm: true });
    } else if (step === 2) {
      history.push(`/${tenant_schema_name}/vendor`, { openForm: true });
    } else {
      onClose();
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

          {/* Step 1  -------------------------------- */}
          <div className="modal-main-content">
            <p className="para-headline">3 SIMPLE STEPS</p>
            <Box sx={{ display: "flex", gap: "20px" }}>
              <div className="numbered-circle numbered-circle-one">{step}</div>
              <div>
                <p className="heading-text">
                  {step === 1
                    ? "Step 1: Add Products"
                    : step === 2
                    ? "Step 2: Add Vendors"
                    : step === 3
                    ? "Step 3: Create Purchase Request!"
                    : "Successful!"}
                </p>
                <p className="para-description">
                  {step === 1
                    ? "Add product will ease your journey using this platform."
                    : step === 2
                    ? "Awesome! just few step to start having an Amazing purchase Module Experience"
                    : step === 3
                    ? "Now at the last step, Enjoy seamless Experience Here."
                    : "You have successfully completed the wizard!"}
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
                    ? "You are done"
                    : ""}
                </button>
              </div>
            </Box>

            {/* End Step 1 ------------------------------ */}

            {/* 2nd section ---------------------------------- */}
            <Box sx={{ display: "flex", gap: "20px" }}>
              <div className="numbered-circle numbered-circle-2">
                {step === 1 ? step + 1 : step === 2 ? step + 1 : ""}
              </div>
              <div>
                <p className="heading-text">
                  {step === 1
                    ? "Step 2: Add Vendors"
                    : step === 2
                    ? "Step 3: Start PR Creation"
                    : ""}
                </p>
                <p className="para-description">
                  {step === 1
                    ? "Awesome! Just a few steps to start having an Amazing Fastra Experience"
                    : step === 2
                    ? "The next step, Enjoy seamless Experience Here"
                    : ""}
                </p>
              </div>
            </Box>
            {/* End step 2 ----------------------------------------- */}

            {/* Step 3 start here ---------------------------------- */}
            <Box sx={{ display: "flex", gap: "20px" }}>
              <div className="numbered-circle numbered-circle-three">
                {step === 1 ? step + 2 : ""}
              </div>
              <div>
                <p className="heading-text">
                  {step === 1
                    ? "Step 3: Create Purchase Request!"
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
          {/* End step 3 ------------------------------ */}
        </Box>
      </Box>
    </Modal>
  );
};

export default PurchaseModuleWizard;
