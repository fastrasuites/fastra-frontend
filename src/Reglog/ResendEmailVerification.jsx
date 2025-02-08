import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { resendVerificationEmail } from "../Reglog/EmailApi";
import { Alert, Button, CircularProgress, Box } from "@mui/material";
import Swal from "sweetalert2";

const ResendEmailVerification = () => {
  const location = useLocation();
  const [isResending, setIsResending] = useState(true);
  const [status, setStatus] = useState("REQUESTING");

  useEffect(() => {
    const resendToken = async () => {
      const params = new URLSearchParams(location.search);
      const tenant = params.get("tenant");

      try {
        await resendVerificationEmail(tenant);
        setStatus("SUCCESS");
        Swal.fire(
          "Email Resent",
          "A new verification email has been sent.",
          "success"
        );
      } catch (error) {
        setStatus("ERROR");
        Swal.fire(
          "Error",
          "Failed to resend verification email. Please try again later.",
          "error"
        );
      } finally {
        setIsResending(false);
      }
    };

    resendToken();
  }, [location.search]);

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
      {isResending ? (
        <CircularProgress />
      ) : (
        <Alert severity={status === "SUCCESS" ? "success" : "error"}>
          {status === "SUCCESS"
            ? "Check your email for a new verification link."
            : "Failed to resend verification email."}
        </Alert>
      )}
      {!isResending && status === "ERROR" && (
        <Button
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
          variant="contained"
        >
          Retry
        </Button>
      )}
    </Box>
  );
};

export default ResendEmailVerification;
