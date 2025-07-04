import React, { useState, useEffect } from "react";
import {
  TextField,
  Box,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import axios from "axios";

function OTPVerification() {
  const history = useHistory();

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [timer, setTimer] = useState(60);

  // Handle OTP input change
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    if (value) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5 && value.length === 1) e.target.nextSibling?.focus();
    }
  };

  // Paste functionality
  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pasteData.every((digit) => !isNaN(digit))) {
      setOtp((prevOtp) => pasteData.concat(prevOtp.slice(pasteData.length)));
    }
  };

  // Handle OTP submission
  const handleSubmit = async () => {
    setError("");
    setMessage("");
    setIsVerifying(true);

    if (otp.includes("")) {
      setError("Please fill in all the OTP fields.");
      setIsVerifying(false);
      return;
    }

    try {
      const response = await axios.post("/api/verify-otp", {
        otp: otp.join(""),
      });

      if (response.status === 200) {
        setMessage("Verification successful!");
        setTimeout(() => history.push("/login"), 1500); // Redirect to login on success
      }
    } catch (error) {
      // Handle failed verification
      if (error.response && error.response.status === 400) {
        setError("Invalid OTP. Please try again.");
      } else if (error.response && error.response.status === 401) {
        setError("Session expired. Please request a new OTP.");
      } else {
        setError("Verification failed. Please try again later.");
      }
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setMessage("");
    setError("");
    setOtp(new Array(6).fill(""));
    setResendEnabled(false);

    try {
      await axios.post("/api/resend-otp");
      setMessage("A new OTP has been sent to your email.");
      setTimer(60); // Reset timer
    } catch {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    } else {
      setResendEnabled(true);
    }
  }, [timer]);

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", textAlign: "center", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {isVerifying ? "Verifying OTP" : "Enter OTP"}
      </Typography>

      {isVerifying ? (
        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
          <CircularProgress />
          <Typography variant="body2" color="textSecondary" mt={2}>
            Please wait, we are verifying your OTP...
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="textSecondary">
            We've sent a 6-digit OTP to your email. Please enter it below.
          </Typography>

          <Grid
            container
            spacing={1}
            justifyContent="center"
            mt={2}
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <Grid item key={index}>
                <TextField
                  variant="outlined"
                  inputProps={{ maxLength: 1, style: { textAlign: "center" } }}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  sx={{
                    width: 40,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#bdbdbd" },
                      "&:hover fieldset": { borderColor: "#3f51b5" },
                      "&.Mui-focused fieldset": { borderColor: "#3f51b5" },
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
            disabled={isVerifying}
          >
            Continue
          </Button>

          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              {resendEnabled ? (
                <Button onClick={handleResendOtp} color="secondary">
                  Resend OTP
                </Button>
              ) : (
                `Resend OTP in ${timer} seconds`
              )}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

export default OTPVerification;
