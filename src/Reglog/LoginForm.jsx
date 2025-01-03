import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import "./LoginForm.css";
import { useTenant } from "../context/TenantContext";

export default function LoginForm() {
  // const [username, setUsername] = useState(""); // Changed from email to username
  const [email, setEmail] = useState(""); // Changed from email to username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();
  const { setTenant } = useTenant();

  // Get tenant name from URL and setTanant for TenantContext for accessibility across the app.
  const fullUrl = window.location.hostname; // e.g., "tenant1.fastra.com"
  const parts = fullUrl.split(".");
  const tenant = parts[0]; // Assuming the first part is the subdomain (tenant name)
  setTenant(tenant);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure email and password are provided
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      // Construct the request URL
      const apiBaseUrl = `https://${tenant}.fastrasuiteapi.com.ng`;
      const loginEndpoint = "/company/login/";
      const requestUrl = apiBaseUrl + loginEndpoint;

      // Send login request
      const response = await axios.post(requestUrl, { email, password });

      // Extract tokens and user info from the response
      const { refresh_token, access_token, user } = response.data;

      // Save tokens to localStorage or sessionStorage securely
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("access_token", access_token);

      // Log user info (optional)
      console.log("Logged-in User:", user);

      // Redirect to dashboard
      const dashboardUrl = `https://${tenant}.fastrasuite.com/dashboard`;
      window.location.href = dashboardUrl; // Redirect to tenant-specific dashboard
    } catch (error) {
      // Handle errors
      if (error.response) {
        if (error.response.status === 400) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError("An error occurred. Please try again later.");
        }
      } else {
        setError(
          "Unable to connect to the server. Check your internet connection."
        );
      }
      console.error("Login Error:", error);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (email && password) {
  //     try {
  //       const response = await axios.post(
  //         `https://${tenant}.fastrasuiteapi.com.ng/company/login/`, // Corrected to HTTPS and endpoint
  //         { email, password } // Use username instead of email
  //       );

  //       const { redirect_url } = response.data;
  //       console.log("what is redirect_url: ", redirect_url);
  //       console.log("what is in response.data", response.data); // Destructure the redirect_url from response
  //       window.location.href = redirect_url; // Redirect to the provided URL
  //     } catch (error) {
  //       if (error.response && error.response.status === 400) {
  //         setError("Invalid credentials");
  //       } else {
  //         setError("An error occurred. Please try again.");
  //       }
  //       console.error("Error logging in:", error);
  //     }
  //   }
  // };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="login-title">Login</h1>
        <p className="login-subtitle">Enter your login details below</p>

        <div className="group-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                {" "}
                {/* Changed from email to username */}
                Email
              </label>
              <input
                type="email" // Change to text since it's a username
                id="email"
                className="form-input"
                placeholder="Enter your email here"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-input"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="login-button">
              Login
            </button>
          </form>

          <div className="login-links">
            <Link to="/" className="register-link">
              Don't have an account?
            </Link>
            <Link to="/forget-password" className="forgot-password-link">
              Forget Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
