import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navbar from "../../components/nav/Navbar";
import styled from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ForgetPassword.css";
import { Box, Button, Typography } from "@mui/material";
import OtpInput from "../../components/Auth/OtpInput";
import Swal from "sweetalert2";

// Extract tenant subdomain once on component mount
const getTenant = () => window.location.hostname.split(".")[0];

// API endpoints
const API_ENDPOINTS = {
  requestPassword: (tenant) =>
    `https://${tenant}.fastrasuiteapi.com.ng/request-forgotten-password/`,
  verifyOtp: (tenant) => `https://${tenant}.fastrasuiteapi.com.ng/verify-otp/`,
  resetPassword: () => `https://fastrasuiteapi.com.ng/reset-password/`,
};

export default function ForgetPassword() {
  const [state, setState] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
    error: "",
  });
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(30);
  const tenant = getTenant();

  // Handle state updates efficiently
  const handleChange = useCallback(
    (field) => (e) => {
      setState((prev) => ({ ...prev, [field]: e.target.value.trim() }));
    },
    []
  );

  // Unified error handler
  const handleError = useCallback((err, fallback) => {
    const msg =
      err.response?.data?.error || err.response?.data?.detail || fallback;
    setState((prev) => ({ ...prev, error: msg }));
    toast.error(msg);
  }, []);

  // Countdown for OTP resend
  useEffect(() => {
    let interval;
    if (step === 1 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // STEP 0 → send email
  const handleEmailSubmit = useCallback(async () => {
    const { email } = state;
    setState((prev) => ({ ...prev, error: "" }));

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState((prev) => ({
        ...prev,
        error: "Please enter a valid email address.",
      }));
      return;
    }

    try {
      const { data } = await axios.post(
        API_ENDPOINTS.requestPassword(tenant),
        { email },
        { withCredentials: true }
      );
      toast.success(data.detail || "Code sent to your email");
      if (data.role === "employee") {
        Swal.fire({
          icon: "info",
          title: "Request Sent ✅",
          text: "Your request for a password reset has been forwarded to your administrator. Your admin will soon send a new password to your email",
          confirmButtonText: "Okay",
          confirmButtonColor: "#3085d6",
        }).then(() => {
          history.back();
        });
        return;
      }
      setStep(1);
      setTimer(60);
    } catch (err) {
      handleError(err, "Unable to send code. Try again.");
    }
  }, [state, tenant, handleError]);

  // STEP 1 → verify OTP
  const handleVerifyCode = useCallback(async () => {
    const { email, otp } = state;
    if (otp.length !== 4) {
      setState((prev) => ({ ...prev, error: "Enter the 4-digit code." }));
      return;
    }

    try {
      await axios.post(
        API_ENDPOINTS.verifyOtp(tenant),
        { email, otp },
        { withCredentials: true }
      );
      toast.success("Code verified!");
      setStep(2);
    } catch (err) {
      handleError(err, "Invalid code. Please retry.");
    }
  }, [state, tenant, handleError]);

  // STEP 2 → reset password
  const handlePasswordReset = useCallback(async () => {
    const { email, newPassword, confirmPassword } = state;

    if (newPassword !== confirmPassword) {
      setState((prev) => ({ ...prev, error: "Passwords do not match." }));
      return;
    }

    try {
      const { data } = await axios.post(
        API_ENDPOINTS.resetPassword(),
        { email, new_password: newPassword, confirm_password: confirmPassword },
        { withCredentials: true }
      );
      toast.success(data.detail || "Password reset successful");
      setStep(3);
    } catch (err) {
      handleError(err, "Failed to reset password.");
    }
  }, [state, handleError]);

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Box display={"flex"} flexDirection={"column"} gap={"28px"}>
            <Box>
              <Typography variant="h4" fontSize={"20px"} fontWeight={700}>
                Forgot Password
              </Typography>
              <Typography
                color={"#828282"}
                whiteSpace={"wrap"}
                maxWidth={"500px"}
                mt={1}
              >
                Enter your email for the verification proccess.
              </Typography>
            </Box>

            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={state.email}
              onChange={handleChange("email")}
              required
            />
            <Button
              variant="contained"
              sx={{ py: "20px" }}
              onClick={handleEmailSubmit}
            >
              Continue
            </Button>
            {state.error && <p className="error-message">{state.error}</p>}
          </Box>
        );

      case 1:
        return (
          <Box display={"flex"} flexDirection={"column"} gap={"28px"}>
            <h2 className="form-title">Verification</h2>
            <p className="form-subtitle">
              Enter the 4-digit code sent to your email.
            </p>
            <Box>
              <OtpInput
                value={state.otp}
                onChange={(val) => setState((prev) => ({ ...prev, otp: val }))}
              />
            </Box>

            {timer > 0 && (
              <Typography color={"red"} textAlign={"center"}>
                00:{timer}
              </Typography>
            )}

            <Button
              variant="contained"
              sx={{ py: "20px" }}
              onClick={handleVerifyCode}
            >
              Continue
            </Button>

            <Typography textAlign={"center"} color={"#828282"}>
              Didn't receive a code?{" "}
              <Button
                variant="text"
                onClick={handleEmailSubmit}
                sx={{ textTransform: "capitalize", color: "red" }}
              >
                Resend
              </Button>
            </Typography>

            {state.error && <p className="error-message">{state.error}</p>}
          </Box>
        );

      case 2:
        return (
          <div className="forget-password-form">
            <h2 className="form-title">Reset Your Password</h2>
            <input
              type="password"
              className="form-input"
              placeholder="New password"
              value={state.newPassword}
              onChange={handleChange("newPassword")}
            />
            <input
              type="password"
              className="form-input"
              placeholder="Confirm new password"
              value={state.confirmPassword}
              onChange={handleChange("confirmPassword")}
            />
            <button className="submit-button" onClick={handlePasswordReset}>
              Reset Password
            </button>
            {state.error && <p className="error-message">{state.error}</p>}
          </div>
        );

      case 3:
        return (
          <div className="confirmation-container">
            <h2 className="confirmation-title">Password Reset Successfully!</h2>
            <p className="confirmation-message">
              You can now log in with your new password.
            </p>
            <button
              className="confirmation-button"
              onClick={() => (window.location.href = "/login")}
            >
              Continue to Login
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FogPasContainer>
      <FogPasNavBar>
        <Navbar />
      </FogPasNavBar>

      <div className="forget-password-container">
        <Box
          p={"40px"}
          bgcolor={"white"}
          boxShadow={" 0px 2px 20px 1px rgba(0,0,0,0.22)"}
          borderRadius={"16px"}
          minWidth={"488px"}
        >
          {renderStep()}
        </Box>
      </div>
    </FogPasContainer>
  );
}

const FogPasContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

const FogPasNavBar = styled.div`
  width: 100%;
  height: 10%;
`;
