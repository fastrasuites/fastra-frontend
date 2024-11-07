// ========== BELOW CODE - FROM CLAUDE ===============================

import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { verifyEmail, resendVerificationEmail } from "../Reglog/EmailApi";
import { Alert, Button, CircularProgress, Box } from "@mui/material";
import Swal from "sweetalert2";

const STATUS = {
  VERIFYING: "VERIFYING",
  SUCCESS: "SUCCESS",
  EXPIRED: "EXPIRED",
  ALREADY_VERIFIED: "ALREADY_VERIFIED",
  INVALID: "INVALID",
  ERROR: "ERROR",
  NO_TOKEN: "NO_TOKEN",
};

const MESSAGE_MAP = {
  [STATUS.VERIFYING]: "Verifying your email...",
  [STATUS.SUCCESS]: "Email verified successfully! Redirecting to login...",
  [STATUS.EXPIRED]:
    "Token has expired. Please request a new verification email.",
  [STATUS.ALREADY_VERIFIED]:
    "Email has already been verified. Redirecting to login...",
  [STATUS.INVALID]: "Invalid token. Please request a new verification email.",
  [STATUS.ERROR]: "Email verification failed. Please try again.",
  [STATUS.NO_TOKEN]: "Invalid verification link.",
};

const EmailVerification = ({ tenantName }) => {
  const location = useLocation();
  const history = useHistory();
  const [status, setStatus] = useState(STATUS.VERIFYING);
  const [isResending, setIsResending] = useState(false);

  const showResendButton = [
    STATUS.EXPIRED,
    STATUS.INVALID,
    STATUS.ERROR,
    STATUS.NO_TOKEN,
  ].includes(status);
  const isLoading = status === STATUS.VERIFYING;

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const tenant = params.get("tenant");

      if (!token) {
        setStatus(STATUS.NO_TOKEN);
        return;
      }

      try {
        await verifyEmail(tenant, token);
        setStatus(STATUS.SUCCESS);
        setTimeout(() => history.push("/login"), 3000);
      } catch (error) {
        // Handle both axios error response and direct error object
        const errorStatus = error?.response?.data?.status || error?.status;

        switch (errorStatus) {
          case "expired":
            setStatus(STATUS.EXPIRED);
            break;
          case "already_verified":
            setStatus(STATUS.ALREADY_VERIFIED);
            setTimeout(() => history.push("/login"), 3000);
            break;
          case "invalid":
            setStatus(STATUS.INVALID);
            break;
          default:
            setStatus(STATUS.ERROR);
            console.error("Verification error:", error);
        }
      }
    };

    verifyToken();
  }, [location.search, tenantName, history]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail(tenantName);
      Swal.fire({
        title: "Email Resent",
        text: "A new verification email has been sent.",
        icon: "success",
        confirmButtonText: "OK",
      });
      setStatus(STATUS.VERIFYING);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to resend verification email. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsResending(false);
    }
  };

  const getAlertSeverity = () => {
    switch (status) {
      case STATUS.SUCCESS:
      case STATUS.ALREADY_VERIFIED:
        return "success";
      case STATUS.EXPIRED:
      case STATUS.INVALID:
      case STATUS.ERROR:
      case STATUS.NO_TOKEN:
        return "error";
      default:
        return "info";
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
        bgcolor: "#f5f5f5",
        padding: 2,
      }}
    >
      <Box sx={{ maxWidth: 400, width: "100%" }}>
        <Alert severity={getAlertSeverity()} sx={{ mb: 2 }}>
          {MESSAGE_MAP[status]}
        </Alert>

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {showResendButton && (
          <Button
            variant="contained"
            onClick={handleResendEmail}
            disabled={isResending}
            fullWidth
            sx={{ mt: 2 }}
          >
            {isResending ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Resending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default EmailVerification;

// ========== ABOVE CODE - FROM CLAUDE ===============================

// ======== ABOVE CODE - OUR CODE ==================
// import React, { useEffect, useState } from "react";
// import { useLocation, useHistory } from "react-router-dom";
// import { verifyEmail, resendVerificationEmail } from "../Reglog/EmailApi";
// import Swal from "sweetalert2";

// const EmailVerification = ({ tenantName }) => {
//   const location = useLocation();
//   const history = useHistory();
//   const [isLoading, setIsLoading] = useState(true);
//   const [verificationMessage, setVerificationMessage] = useState(
//     "Verifying your email..."
//   );
//   const [showResendButton, setShowResendButton] = useState(false);

//   useEffect(() => {
//     const verifyToken = async () => {
//       const params = new URLSearchParams(location.search);
//       const token = params.get("token");
//       const tenant = params.get("tenant");

//       if (token) {
//         try {
//           await verifyEmail(tenant, token);
//           setVerificationMessage(
//             "Email verified successfully! Redirecting to login..."
//           );
//           setShowResendButton(false); // Hide button on successful verification
//           setTimeout(() => history.push("/login"), 3000); // Redirect after 3 seconds
//         } catch (error) {
//           setVerificationMessage(error.message);
//           setShowResendButton(true);

//           if (error.status === "expired" ) {
//             setVerificationMessage(
//               "Token has expired. Please request a new verification email."
//             );
//             setShowResendButton(true); // Show button only if the token is expired
//           } else if (error.status === "already_verified" ) {
//             setVerificationMessage(
//               "Email has already been verified. Redirecting to login..."
//             );
//             setShowResendButton(false); // Hide button on successful verification
//             setTimeout(() => history.push("/login"), 3000); // Redirect after 3 seconds
//           } else if (error.status === "invalid") {
//             setVerificationMessage(
//               "Invalid token. Please request a new verification email."
//             );
//             setShowResendButton(true); // Show button only if the token is invalid
//           }else {
//             setVerificationMessage(
//               "Email verification failed. Please try again."
//             );
//             setShowResendButton(false);
//           }
//         }
//       }
//       else {
//         setVerificationMessage("Invalid verification link.");
//         setShowResendButton(false);
//       }
//       setIsLoading(false);
//     };

//     verifyToken();
//   }, [location.search, tenantName, history]);

//   const handleResendEmail = async () => {
//     try {
//       await resendVerificationEmail(tenantName);
//       Swal.fire({
//         title: "Email Resent",
//         text: "A new verification email has been sent.",
//         icon: "success",
//         confirmButtonText: "OK",
//       });
//       setShowResendButton(false); // Hide the button after resending
//     } catch (error) {
//       Swal.fire({
//         title: "Error",
//         text: "Failed to resend verification email. Please try again later.",
//         icon: "error",
//         confirmButtonText: "OK",
//       });
//     }
//   };

//   return (
//     <div
//       style={{
//         height: "100vh",
//         width: "100%",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "red",
//         fontSize: "18px",
//         color: "white",
//       }}
//     >
//       <div>{verificationMessage}</div>
//       {isLoading && <div style={{ marginTop: "10px" }}>Loading spinner...</div>}
//       {!isLoading && showResendButton && (
//         <button
//           onClick={handleResendEmail}
//           style={{
//             marginTop: "15px",
//             padding: "10px 20px",
//             fontSize: "16px",
//             color: "white",
//             backgroundColor: "blue",
//             border: "none",
//             borderRadius: "5px",
//             cursor: "pointer",
//           }}
//         >
//           Resend Verification Email
//         </button>
//       )}
//     </div>
//   );
// };

// export default EmailVerification;
// ======== MISS CODE - OUR CODE ==================
