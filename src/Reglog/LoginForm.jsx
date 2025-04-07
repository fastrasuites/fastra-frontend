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
      const { access_token, tenant_schema_name, ...rest } = response.data || {};
      console.log("Login Response:", response.data);

      login({ access_token, tenant_schema_name, ...rest });

      console.log("i got here");

      // Redirect to dashboard
      history.push(`/${tenant_schema_name}/dashboard`);
      // const dashboardUrl = `${PROTOCOL}://${MAIN_DOMAIN_URL}/${tenant_schema_name}/dashboard`;
      // window.location.href = dashboardUrl; // Redirect to tenant-specific dashboard
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setError(
            error.response.data.error
              ? error.response.data.error
              : error.response.data
          );
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
            {/* <Link to="/forget-password" className="forgot-password-link">
              Forget Password
            </Link> */}
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
