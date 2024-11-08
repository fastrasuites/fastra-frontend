import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { verifyEmail } from "../api"; // Your API function
import { Alert, CircularProgress, Box } from "@mui/material";
import { useTenant } from "../context/TenantContext";

// This will fetch the domain from the .env file
// const MAIN_DOMAIN = process.env.REACT_APP_MAIN_DOMAIN;
const MAIN_DOMAIN = "fastra-frontend.vercel.app" || "fastrsuite.com";

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
    "Email verified successfully! Redirecting to your dashboard...",
  [STATUS.EXPIRED]:
    "Your verification link has expired. Redirecting to resend verification page...",
  [STATUS.ALREADY_VERIFIED]:
    "Your email is already verified. Redirecting to your dashboard...",
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
  const { setTenant } = useTenant(); // Use context to set tenant

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const tenant = params.get("tenant");

      // If no token is provided in the URL
      if (!token) {
        setStatus(STATUS.NO_TOKEN);
        return;
      }

      // Set tenant in the global context
      if (tenant) {
        setTenant(tenant);
      }

      try {
        // Call your API to verify the email token
        await verifyEmail(tenant, token);
        setStatus(STATUS.SUCCESS);
        setTimeout(() => {
          // Redirecting the user to the tenant-specific dashboard
          window.location.href = `https://${tenant}.${MAIN_DOMAIN}/login`;
        }, 3000);
      } catch (error) {
        // Normalize status to lowercase for comparison
        const errorStatus = (
          error?.response?.data?.status ||
          error?.status ||
          ""
        ).toLowerCase();

        // Handle different error statuses and redirect accordingly
        switch (errorStatus) {
          case STATUS.EXPIRED:
            setStatus(STATUS.EXPIRED);
            setTimeout(() => {
              window.location.href = `https://${tenant}.${MAIN_DOMAIN}/resend-email-verification`;
            }, 3000);
            break;
          case STATUS.ALREADY_VERIFIED:
            setStatus(STATUS.ALREADY_VERIFIED);
            setTimeout(() => {
              window.location.href = `https://${tenant}.${MAIN_DOMAIN}/login`;
            }, 3000);
            break;
          case STATUS.INVALID:
            setStatus(STATUS.INVALID);
            setTimeout(() => {
              window.location.href = `https://${tenant}.${MAIN_DOMAIN}/resend-email-verification`;
            }, 3000);
            break;
          default:
            setStatus(STATUS.ERROR);
        }
      }
    };

    verifyToken();
  }, [location.search, history, setTenant]); // Run when the URL changes (i.e., when query params change)

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f5f5",
        padding: 2,
      }}
    >
      <Alert severity={SEVERITY_MAP[status]}>{MESSAGE_MAP[status]}</Alert>
      {status === STATUS.VERIFYING && <CircularProgress sx={{ mt: 2 }} />}
    </Box>
  );
}

export default EmailVerification;
