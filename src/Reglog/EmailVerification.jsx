import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { verifyEmail } from "../api";

const EmailVerification = () => {
  const [status, setStatus] = useState("Verifying...");
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (token) {
        try {
          await verifyEmail(token);
          setStatus("Email verified successfully. You can now log in.");
          setTimeout(() => history.push("login"), 3000);
        } catch (error) {
          setStatus(
            "Email verification failed. Please try again or contact support."
          );
        }
      } else {
        setStatus("Invalid verification link.");
      }
    };

    verifyToken();
  }, [location, history]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{status}</p>
    </div>
  );
};

export default EmailVerification;
