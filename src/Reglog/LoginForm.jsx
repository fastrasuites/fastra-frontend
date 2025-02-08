import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import "./LoginForm.css";
import { useTenant } from "../context/TenantContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useTenant();
  const history = useHistory();

  // // checks url for localhost:3000 or app.fastrasuite.com
  // const MAIN_DOMAIN_URL = window.location.href.includes("app.fastrasuite.com")
  //   ? "app.fastrasuite.com"
  //   : "localhost:3000";

  // // Determine protocol dynamically (http for localhost, https for production)
  // const PROTOCOL = window.location.protocol.includes("https")
  //   ? "https"
  //   : "http";

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

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const apiBaseUrl = `https://fastrasuiteapi.com.ng`;
      const loginEndpoint = "/login/";
      const requestUrl = apiBaseUrl + loginEndpoint;

      const response = await axios.post(requestUrl, { email, password });
      const { tenant_company_name, access_token, ...rest } = response.data;

      login({ tenant_company_name, access_token, ...rest });
      history.push("/dashboard");
      // Redirect to dashboard
      // const dashboardUrl = `${PROTOCOL}://${MAIN_DOMAIN_URL}/${tenant_company_name}/dashboard`;
      // window.location.href = dashboardUrl; // Redirect to tenant-specific dashboard
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          setError(
            data?.message ||
              "Invalid email or password. Please check your credentials and try again."
          );
        } else if (status === 401) {
          setError(
            "Unauthorized access. Please check your login details and try again."
          );
        } else if (status === 403) {
          setError(
            "Access denied. You do not have permission to access this resource."
          );
        } else if (status === 404) {
          setError("Server not found. Please try again later.");
        } else if (status === 500) {
          setError("Internal server error. Please try again later.");
        } else {
          setError(
            data?.message || "An unexpected error occurred. Please try again."
          );
        }
      } else if (error.request) {
        setError(
          "No response from the server. Please check your internet connection and try again."
        );
      } else {
        setError(
          "An unexpected error occurred. Please refresh the page and try again."
        );
      }

      console.error("Login Error:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="login-title">Login</h1>
        <p className="login-subtitle">Enter your login details below</p>

        <div className="group-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
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

//  // checks url for localhost:3000 or app.fastrasuite.com
//   const MAIN_DOMAIN = window.location.href.includes("app.fastrasuite.com")
//     ? "app.fastrasuite.com"
//     : "localhost:3000";

//   // Determine protocol dynamically (http for localhost, https for production)
//   const PROTOCOL = window.location.protocol.includes("https")
//     ? "https"
//     : "http";

// // Redirect to dashboard
//       window.location.href = dashboardUrl; // Redirect to tenant-specific dashboard
//       const dashboardUrl = `${PROTOCOL}://${MAIN_DOMAIN}/${tenant}/dashboard`;
