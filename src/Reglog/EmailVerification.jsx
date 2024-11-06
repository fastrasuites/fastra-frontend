import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { verifyEmail, resendVerificationEmail } from "../Reglog/EmailApi";
import Swal from "sweetalert2";

const EmailVerification = ({ tenantName }) => {
  const location = useLocation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationMessage, setVerificationMessage] = useState(
    "Verifying your email..."
  );
  const [showResendButton, setShowResendButton] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const tenant = params.get("tenant");

      if (token) {
        try {
          await verifyEmail(tenant, token);
          setVerificationMessage(
            "Email verified successfully! Redirecting to login..."
          );
          setShowResendButton(false); // Hide button on successful verification
          setTimeout(() => history.push("/login"), 3000); // Redirect after 3 seconds
        } catch (error) {
          if (error.message.includes("expired")) {
            setVerificationMessage(
              "Token has expired. Please request a new verification email."
            );
            setShowResendButton(true); // Show button only if the token is expired
          } else {
            setVerificationMessage(
              "Email verification failed. Please try again."
            );
            setShowResendButton(false);
          }
        }
      } else {
        setVerificationMessage("Invalid verification link.");
        setShowResendButton(false);
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [location.search, tenantName, history]);

  const handleResendEmail = async () => {
    try {
      await resendVerificationEmail(tenantName);
      Swal.fire({
        title: "Email Resent",
        text: "A new verification email has been sent.",
        icon: "success",
        confirmButtonText: "OK",
      });
      setShowResendButton(false); // Hide the button after resending
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to resend verification email. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "red",
        fontSize: "18px",
        color: "white",
      }}
    >
      <div>{verificationMessage}</div>
      {isLoading && <div style={{ marginTop: "10px" }}>Loading spinner...</div>}
      {!isLoading && showResendButton && (
        <button
          onClick={handleResendEmail}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            fontSize: "16px",
            color: "white",
            backgroundColor: "blue",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Resend Verification Email
        </button>
      )}
    </div>
  );
};

export default EmailVerification;
