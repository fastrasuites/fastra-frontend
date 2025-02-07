import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/nav/Navbar";
import styled from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ForgetPassword.css";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(0);
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30); // 30 seconds countdown
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Get tenant name from URL
  const fullUrl = window.location.hostname; // e.g., "tenant1.fastra.com"
  const parts = fullUrl.split(".");
  const tenantName = parts[0]; // Assuming the first part is the subdomain (tenant name)

  // Start countdown timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  // Send email to backend for password reset request
  const handleEmailSubmit = async () => {
    try {
      const response = await axios.post(
        `https://${tenantName}.fastrasuite.com/request-forgotten-password/`, // Correct endpoint
        { email }
      );
      setStep(1); // Move to next step (Enter code)
      toast.success(response.data.detail); // Notify user
    } catch (error) {
      const errorMsg =
        error.response?.data.error || "Failed to send code. Please try again.";
      setError(errorMsg); // Show error message
    }
  };

  // Verify the 4-digit code
  const handleVerifyCode = async () => {
    try {
      const codeString = code.join(""); // Combine code array to string
      const response = await axios.post(
        `https://${tenantName}.fastrasuite.com/request-forgotten-password/`, // Ensure correct endpoint
        { email, code: codeString }
      );
      setStep(2); // Move to next step (Reset password)
      toast.success("Code verified successfully!"); // Notify user
    } catch (error) {
      const errorMsg =
        error.response?.data.error || "Invalid code. Please try again.";
      setError(errorMsg); // Show error message
    }
  };

  // Resend the code
  const handleResendCode = async () => {
    setTimer(30); // Reset the timer
    await handleEmailSubmit();
  };

  // Submit the new password
  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const response = await axios.post(
        "https://fastrav1-production.up.railway.app/reset-password", // Ensure correct endpoint
        { email, newPassword }
      );
      toast.success(response.data.detail); // Notify user
      setStep(3); // Move to success message
    } catch (error) {
      const errorMsg =
        error.response?.data.error || "Failed to reset password.";
      setError(errorMsg); // Show error message
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
                onChange={(e) => setEmail(e.target.value)}
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
              <h2 className="form-title">Enter Verification Code</h2>
              <p className="form-subtitle">
                We've sent a code to your email. It expires in {timer} seconds.
              </p>
              <div className="f-group">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    className="form-input"
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => {
                      const newCode = [...code];
                      newCode[index] = e.target.value;
                      setCode(newCode);
                    }}
                  />
                ))}
              </div>
              <button className="submit-button" onClick={handleVerifyCode}>
                Verify
              </button>
              {timer === 0 && (
                <p className="login-link">
                  Didn't receive a code?{" "}
                  <button onClick={handleResendCode} className="resend-link">
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
