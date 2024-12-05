import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useHistory } from "react-router-dom";
// import axios from "axios";
import "./LoginForm.css";
import { AuthContext } from "../context/AuthContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();
  const { loginUser } = useContext(AuthContext);

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
    console.log("Email:", email, "Password:", password);
    // Ensure email and password are provided
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      await loginUser(email, password);
      // Redirect to the dashboard or another authenticated route
      console.log("Redirecting to dashboard");
      history.push("/dashboard");
    } catch (err) {
      // Handle errors, including network or authentication errors
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 404) {
        setError("Tenant not found. Please check your subdomain.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
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
                {" "}
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

// Get tenant name from URL
  /*
  const fullUrl = window.location.hostname; // e.g., "tenant1.fastra.com"
  const parts = fullUrl.split(".");
  const tenantName = parts[0]; // Assuming the first part is the subdomain (tenant name)  
  */

// try {
//   // Construct the request URL
//   const apiBaseUrl = `https://${tenantName}.fastrasuiteapi.com.ng`;
//   const loginEndpoint = "/company/login/";
//   const requestUrl = apiBaseUrl + loginEndpoint;

//   // Send login request
//   const response = await axios.post(requestUrl, { email, password });

//   // Extract tokens and user info from the response
//   const { refresh_token, access_token, user } = response.data;

//   // Save tokens to localStorage or sessionStorage securely
//   localStorage.setItem("refresh_token", refresh_token);
//   localStorage.setItem("access_token", access_token);

//   // Log user info (optional)
//   console.log("Logged-in User:", user);

//   // Redirect to dashboard
//   const dashboardUrl = `https://${tenantName}.fastrasuite.com/dashboard`;
//   window.location.href = dashboardUrl; // Redirect to tenant-specific dashboard
// } catch (error) {
//   // Handle errors
//   if (error.response) {
//     if (error.response.status === 400) {
//       setError("Invalid email or password. Please try again.");
//     } else {
//       setError("An error occurred. Please try again later.");
//     }
//   } else {
//     setError(
//       "Unable to connect to the server. Check your internet connection."
//     );
//   }
//   console.error("Login Error:", error);
// }
