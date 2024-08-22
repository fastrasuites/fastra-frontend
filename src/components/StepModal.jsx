import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const StepModal = ({ open, onClose, step, onNextStep }) => {
  // const navigate = useNavigate();

  const handleSetUpCompany = () => {
    onClose();
    // navigate("/company");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "15%",
          left: "15%",
          width: "70%",
          height: "70%",
          bgcolor: "white",
          borderRadius: "10px",
          paddingLeft: "16px",
          boxShadow: "24",
          // border: "solid 2px red",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            position: "absolute",
            top: "30px",
            right: "5%",
            zIndex: "99",
            borderRadius: "5px",
            textTransform: "none",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px 32px",
            bgcolor: "#FFFFFF",
            border: "2px solid #7A8A98",
            cursor: "pointer",
            "&:hover": { border: "2px solid #3367CC", bgcolor: "#FFFFFF" },
          }}
        >
          Skip
        </Button>
        <Box sx={{ position: "relative", height: "100%" }}>
          <Box
            sx={{
              position: "absolute",
              left: "30px",
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
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "10px",
              marginLeft: "10px",
              border: "10px solid white",
            }}
          >
            1
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
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "10px",
              border: "10px solid white",
            }}
          >
            2
          </Box>
          <div style={{ marginLeft: "120px", paddingTop: "70px" }}>
            <Typography
              sx={{
                color: "#3B7CED",
                marginBottom: "14px",
                textAlign: "left",
              }}
            >
              3 SIMPLE STEPS
            </Typography>
            <Typography
              sx={{
                // backgroundColor: "",
                fontWeight: "900",
                fontSize: "40px",
                textAlign: "left",
                color: "#1A1A1A",
                padding: "5px",
                marginBottom: "1rem",
              }}
            >
              Step 1: Company Settings
            </Typography>
            <Typography
              sx={{
                fontFamily: "Product Sans",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "16.98px",
                textAlign: "left",
                color: "#7A8A98",
                marginBottom: "60px",
              }}
            >
              Awesome! Just a few steps to start having an Amazing Fastra
              Experience
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
                "&:hover": {
                  background: "#3367CC",
                },
              }}
            >
              Set up Your Company
            </Button>
          </div>
        </Box>
      </Box>
    </Modal>
  );
};

export default StepModal;
