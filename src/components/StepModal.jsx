import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { useHistory } from "react-router-dom";
import "./stepModal.css";

const StepModal = ({ open, onClose, step, onNextStep }) => {
  const history = useHistory();

  const handleSetUpCompany = () => {
    onClose();
    if (step === 1) {
      history.push("/company", { openForm: true });
    } else if (step === 2) {
      history.push("/user", { openForm: true });
    } else {
      alert(" Humm! The last stage is not ready. Please use the skip button.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="modal">
      <Box className="modal-content-wrapper">
        <button className="btn-skip" onClick={onClose}>
          Skip
        </button>
        <Box sx={{ position: "relative", height: "100%" }}>
          <Box
            sx={{
              position: "absolute",
              left: "32px",
              top: "0",
              buttom: "10px",
              width: "4px",
              height: "calc(100% - 50px)",
              bgcolor: "#3B7CED",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              left: "-15px",
              top: "100px",
              width: "60px",
              height: "60px",
              bgcolor: "#E2E6E9",
              color: "#3B7CED",
              fontWeight: "900",
              lineHeight: "58.22px",
              fontSize: "48px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "10px",
              marginLeft: "10px",
              border: "10px solid white",
            }}
          >
            {step}
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "-15px",
              bottom: "10px",
              width: "60px",
              height: "60px",
              bgcolor: "#E2E6E9",
              color: "#3B7CED",
              fontWeight: "900",
              lineHeight: "58.22px",
              fontSize: "48px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "10px",
              border: "10px solid white",
            }}
          >
            {step + 1 <= 3 ? step + 1 : ""}
          </Box>
          {/* Step 1  -------------------------------- */}
          <div style={{ marginLeft: "120px", paddingTop: "70px" }}>
            <Typography
              sx={{
                color: "#3B7CED",
                marginBottom: "14px",
                textAlign: "left",
                fontSize: "20px",
                fontWeight: "700",
                lineHeight: "24.26px",
              }}
            >
              3 SIMPLE STEPS
            </Typography>
            <p className="heading-text">
              {step === 1
                ? "Step 1: Company Setting"
                : step === 2
                ? "Step 2: User Creation"
                : step === 3
                ? "step 3: Project Creation"
                : "Registration Successful"}
            </p>
            <Typography
              sx={{
                fontFamily: "Product Sans",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "16.98px",
                textAlign: "left",
                color: "#7A8A98",
                marginBottom: "40px",
              }}
            >
              {step === 1
                ? "A company set-up will ease your journey using this platform."
                : step === 2
                ? "Awesome! Just a few steps to start having an Amazing Fastra Experience"
                : step === 3
                ? "Now at the last step, Enjoy seamless Experience Here."
                : ""}
            </Typography>
            <Button
              onClick={handleSetUpCompany}
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "start",
                alignItems: "center",
                padding: "16px 20px",
                background: "#3B7CED",
                boxShadow: "0px 32px 24px rgba(26, 26, 26, 0.08)",
                borderRadius: "4px",
                fontStyle: "normal",
                fontWeight: "400",
                fontSize: "18px",
                lineHeight: "24px",
                textAlign: "center",
                color: "#FFFFFF",
                marginBottom: "72px",
                "&:hover": {
                  background: "#3367CC",
                },
              }}
            >
              {step === 1
                ? "Set up your Company!"
                : step === 2
                ? "Start User Creation!"
                : step === 3
                ? "Start Project Creation!"
                : "You are done"}
            </Button>

            {/* End Step 1 ------------------------------ */}

            {/* Step 2 ---------------------------------- */}

            <Typography
              sx={{
                color: "#3B7CED",
                marginBottom: "16px",
                textAlign: "left",
                fontSize: "20px",
                fontWeight: "700",
                lineHeight: "24.26px",
              }}
            >
              3 SIMPLE STEPS
            </Typography>
            <Typography
              sx={{
                fontWeight: "900",
                fontSize: "40px",
                textAlign: "left",
                color: "#1A1A1A",
                marginBottom: "4px",
              }}
            >
              {step === 1
                ? "Step 2: User Creation"
                : step === 2
                ? "step 3: Project Creation"
                : "Registration Successful"}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Product Sans",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "16.98px",
                textAlign: "left",
                color: "#7A8A98",
                marginBottom: "40px",
              }}
            >
              {step === 1
                ? "Awesome! Just a few steps to start having an Amazing Fastra Experience"
                : step === 2
                ? "Now at the last step, Enjoy seamless Experience Here."
                : ""}
            </Typography>
          </div>
          {/* End step 2 ------------------------------ */}
        </Box>
      </Box>
    </Modal>
  );
};

export default StepModal;
