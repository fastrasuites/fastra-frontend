import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navbar from "../../components/nav/Navbar";
import styled from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ForgetPassword.css";
import { Box } from "@mui/material";
import OtpInput from "../../components/Auth/OtpInput";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Extract tenant subdomain
  const tenant = window.location.hostname.split(".")[0];

  // Countdown for OTP resend
  useEffect(() => {
    if (step === 1 && timer > 0) {
      const id = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [step, timer]);

  // Unified error handler
  const handleError = useCallback((err, fallback) => {
    const msg =
      err.response?.data?.error || err.response?.data?.detail || fallback;
    setError(msg);
    toast.error(msg);
  }, []);

  // STEP 0 → send email
  const handleEmailSubmit = async () => {
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const { data } = await axios.post(
        `https://${tenant}.fastrasuiteapi.com.ng/request-forgotten-password/`,
        { email },
        { withCredentials: true }
      );
      toast.success(data.detail || "Code sent to your email");
      setStep(1);
      setTimer(30);
    } catch (err) {
      console.error("Error sending code:", err);
      handleError(err, "Unable to send code. Try again.");
    }
  };

  // STEP 1 → verify OTP
  const handleVerifyCode = async () => {
    if (otp.length !== 4) {
      setError("Enter the 4-digit code.");
      return;
    }
    try {
      await axios.post(
        `https://${tenant}.fastrasuiteapi.com.ng/verify-otp/`,
        {
          email, // explicitly include email
          otp, // use 'otp' instead of 'refresh'
        },
        { withCredentials: true }
      );
      toast.success("Code verified!");
      setStep(2);
    } catch (err) {
      console.error("Error verifying code:", err);
      handleError(err, "Invalid code. Please retry.");
    }
  };

  const handleResendCode = () => {
    setTimer(30);
    handleEmailSubmit();
  };

  // STEP 2 → reset password
  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const { data } = await axios.post(
        `https://${tenant}.fastrasuiteapi.com.ng/reset-password/`,
        {
          email,
          new_password: newPassword,
        },
        { withCredentials: true }
      );
      toast.success(data.detail || "Password reset successful");
      setStep(3);
    } catch (err) {
      handleError(err, "Failed to reset password.");
    }
  };

  return (
    <FogPasContainer>
      <FogPasNavBar>
        <Navbar />
      </FogPasNavBar>

      <div className="forget-password-container">
        <div className="forget-password-form-wrapper">
          {step === 0 && (
            <div className="forget-password-form">
              <h2 className="form-title">Forgot Password</h2>
              <p className="form-subtitle">
                Enter your email to receive a verification code.
              </p>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
              />
              <button className="submit-button" onClick={handleEmailSubmit}>
                Continue
              </button>
              {error && <p className="error-message">{error}</p>}
            </div>
          )}

          {step === 1 && (
            <div className="forget-password-form">
              <h2 className="form-title">Verification</h2>
              <p className="form-subtitle">
                Enter the 4-digit code sent to your email.
              </p>
              <Box>
                <OtpInput value={otp} onChange={setOtp} />
              </Box>

              <button className="submit-button" onClick={handleVerifyCode}>
                Continue
              </button>

              {timer > 0 ? (
                <p className="timer-text">Resend in {timer}s</p>
              ) : (
                <p className="login-link">
                  Didn't receive a code?{" "}
                  <button className="resend-link" onClick={handleResendCode}>
                    Resend another code
                  </button>
                </p>
              )}

              {error && <p className="error-message">{error}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="forget-password-form">
              <h2 className="form-title">Reset Your Password</h2>
              <input
                type="password"
                className="form-input"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button className="submit-button" onClick={handlePasswordReset}>
                Reset Password
              </button>
              {error && <p className="error-message">{error}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="confirmation-container">
              <h2 className="confirmation-title">
                Password Reset Successfully!
              </h2>
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
          )}
        </div>
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
