import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Alert, CircularProgress, Button, Box } from "@mui/material";
import { verifyEmail, resendVerificationEmail } from "./EmailApi";
import Swal from "sweetalert2";

// const MAIN_DOMAIN_URL =
//   process.env.REACT_APP_MAIN_DOMAIN_URL || "localhost:3000";

// const MAIN_DOMAIN_URL = !window.location.href.includes("app.fastrasuite.com")
//   ? "localhost:3000"
//   : "app.fastrasuite.com";

const STATUS = {
  VERIFYING: "verifying",
  SUCCESS: "success",
  EXPIRED: "expired",
  ALREADY_VERIFIED: "already_verified",
  INVALID: "invalid",
  ERROR: "error",
  NO_TOKEN: "no_token",
};

const MESSAGE_MAP = {
  [STATUS.VERIFYING]: "Verifying your email. Please wait...",
  [STATUS.SUCCESS]:
    "Email verified successfully! Redirecting you to login page...",
  [STATUS.EXPIRED]:
    "Your verification link has expired. Redirecting to resend verification page...",
  [STATUS.ALREADY_VERIFIED]:
    "Your email is already verified. Redirecting you to login page...",
  [STATUS.INVALID]:
    "Invalid verification link. Redirecting to resend verification page...",
  [STATUS.ERROR]:
    "An error occurred during verification. Please try again later.",
  [STATUS.NO_TOKEN]:
    "No verification token provided. Please check your email link.",
};

const SEVERITY_MAP = {
  [STATUS.SUCCESS]: "success",
  [STATUS.EXPIRED]: "warning",
  [STATUS.ALREADY_VERIFIED]: "info",
  [STATUS.INVALID]: "error",
  [STATUS.ERROR]: "error",
  [STATUS.NO_TOKEN]: "error",
  [STATUS.VERIFYING]: "info",
};

function EmailVerification() {
  const location = useLocation();
  const history = useHistory();
  const [status, setStatus] = useState(STATUS.VERIFYING);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const tenant = params.get("tenant");

      if (!token) {
        setStatus(STATUS.NO_TOKEN);
        return;
      }

      if (!tenant) {
        setStatus(STATUS.INVALID);
        return;
      }

      try {
        await verifyEmail(tenant, token);
        setStatus(STATUS.SUCCESS);
        setTimeout(() => history.push("/login"), 3000);
      } catch (error) {
        console.error("Email verification error:", error);
        const errorStatus = (
          error?.response?.data?.status ||
          error?.status ||
          ""
        ).toLowerCase();

        switch (errorStatus) {
          case STATUS.EXPIRED:
            setStatus(STATUS.EXPIRED);
            setTimeout(() => history.push("/resend-email-verification"), 3000);
            break;
          case STATUS.ALREADY_VERIFIED:
            setStatus(STATUS.ALREADY_VERIFIED);
            setTimeout(() => history.push("/login"), 3000);
            break;
          case STATUS.INVALID:
            setStatus(STATUS.INVALID);
            setTimeout(() => history.push("/resend-email-verification"), 3000);
            break;
          default:
            setStatus(STATUS.ERROR);
        }
      }
    };

    verifyToken();
  }, [location.search, history]);

  const handleResendVerification = async () => {
    const params = new URLSearchParams(location.search);
    const tenant = params.get("tenant");

    if (!tenant) {
      Swal.fire("Error", "Tenant information is missing.", "error");
      return;
    }

    setIsResending(true);
    try {
      await resendVerificationEmail(tenant);
      Swal.fire(
        "Email Resent",
        "A new verification email has been sent. Please check your inbox.",
        "success"
      );
    } catch (error) {
      Swal.fire(
        "Error",
        "Failed to resend verification email. Please try again later.",
        "error"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "transparent",
        padding: 2,
      }}
    >
      <Alert severity={SEVERITY_MAP[status]} aria-live="polite">
        {MESSAGE_MAP[status]}
      </Alert>
      {status === STATUS.VERIFYING && <CircularProgress sx={{ mt: 2 }} />}
      {status === STATUS.ERROR && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleResendVerification}
          disabled={isResending}
          sx={{ mt: 2 }}
        >
          {isResending ? "Sending..." : "Resend Verification"}
        </Button>
      )}
    </Box>
  );
}

export default EmailVerification;
