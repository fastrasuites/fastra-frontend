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

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (token) {
        try {
          await verifyEmail(tenantName, token);
          setVerificationMessage(
            "Email verified successfully! Redirecting to login..."
          );
          setTimeout(() => history.push("/login"), 3000); // Redirect after 3 seconds
        } catch (error) {
          if (error.message === "Token expired") {
            Swal.fire({
              title: "Token Expired",
              text: "Click below to resend the verification email.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Resend Verification Email",
              cancelButtonText: "Cancel",
            }).then(async (result) => {
              if (result.isConfirmed) {
                await handleResendEmail();
              }
            });
          } else {
            setVerificationMessage(
              "Email verification failed. Please try again."
            );
          }
        }
      } else {
        setVerificationMessage("Invalid verification link.");
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
      }}
    >
      <div>{verificationMessage}</div>
      {isLoading && <div style={{ marginTop: "10px" }}>Loading spinner...</div>}
    </div>
  );
};

export default EmailVerification;

// ==========================================================================

// import React, { useEffect, useState } from "react";
// import { useLocation, useHistory } from "react-router-dom";
// import { verifyEmail, resendVerificationEmail } from "../Reglog/EmailApi";
// import Swal from "sweetalert2";

// const EmailVerification = ({ tenantName }) => {
//   const location = useLocation();
//   const history = useHistory();

//   useEffect(() => {
//     const verifyToken = async () => {
//       const params = new URLSearchParams(location.search);
//       const token = params.get("token");

//       if (token) {
//         try {
//           await verifyEmail(tenantName, token);
//           // Show success alert
//           Swal.fire({
//             title: "Success!",
//             text: "Email verified successfully. You can now log in.",
//             icon: "success",
//             confirmButtonText: "OK"
//           }).then(() => {
//             history.push("/login"); // Redirect after confirmation
//           });
//         } catch (error) {
//           if (error.message === "Token expired") {
//             Swal.fire({
//               title: "Token Expired",
//               text: "Click below to resend the verification email.",
//               icon: "warning",
//               showCancelButton: true,
//               confirmButtonText: "Resend Email",
//               cancelButtonText: "Cancel"
//             }).then(async (result) => {
//               if (result.isConfirmed) {
//                 await handleResendEmail(token);
//               }
//             });
//           } else {
//             Swal.fire({
//               title: "Verification Failed",
//               text: "Email verification failed. Please try again or contact support.",
//               icon: "error",
//               confirmButtonText: "OK"
//             });
//           }
//         }
//       } else {
//         Swal.fire({
//           title: "Invalid Link",
//           text: "Invalid verification link.",
//           icon: "error",
//           confirmButtonText: "OK"
//         });
//       }
//     };

//     verifyToken();
//   }, [location, history, tenantName]);

//   const handleResendEmail = async (token) => {
//     try {
//       await resendVerificationEmail(tenantName, token);
//       Swal.fire({
//         title: "Email Resent",
//         text: "A new verification email has been sent.",
//         icon: "success",
//         confirmButtonText: "OK"
//       });
//     } catch (error) {
//       Swal.fire({
//         title: "Error",
//         text: "Failed to resend verification email. Please try again later.",
//         icon: "error",
//         confirmButtonText: "OK"
//       });
//     }
//   };

//   return <div>Verifying your email...</div>; // Placeholder while verifying
// };

// export default EmailVerification;

// ---------------------

// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";

// const EmailVerifyStatus = ({ tenantName }) => {
//   const { search } = useLocation();
//   const queryParams = new URLSearchParams(search);
//   const status = queryParams.get("status");
//   const token = queryParams.get("token");
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     if (status) {
//       if (status === "expired") {
//         setMessage(
//           "Your verification link has expired. Please request a new one."
//         );
//       } else {
//         setMessage(status);
//       }
//     }
//   }, [status]);

//   const resendVerification = async () => {
//     try {
//       const response = await fetch(
//         `https://${tenantName}.fastrasuite.com/api/resend-verification-email?token=${token}`
//       );
//       const data = await response.json();
//       alert(data.detail || "Verification email has been sent.");
//     } catch (error) {
//       console.error("Error resending email:", error);
//       alert("An error occurred while resending the verification email.");
//     }
//   };

//   return (
//     <div>
//       <h1>Email Verification</h1>
//       <p>{message}</p>
//       {status === "expired" && token && (
//         <button onClick={resendVerification}>Resend Verification Email</button>
//       )}
//     </div>
//   );
// };

// export default EmailVerifyStatus;
