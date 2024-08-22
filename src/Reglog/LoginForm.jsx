import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import "./LoginForm.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();

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
    if (isFormValid) {
      try {
        const response = await axios.post(
          "https://fastrav1-production.up.railway.app/login/",
          {
            email: email,
            password: password,
          }
        );
        // Handle success response
        console.log(response.data);
        // Redirect to dashboard
        history.push("/dashboard");
      } catch (error) {
        setError("Invalid credentials");
        console.error("Error logging in:", error);
      }
    }
  };

  const isEmailValid = email.trim() !== "";
  const isPasswordValid = password.trim() !== "";
  const isFormValid = isEmailValid && isPasswordValid;

  return (
    <div className="lf">
      <div className="lfwrap">
        <h2 className="title">Login</h2>
        <p className="paragraph">Enter your log in details below</p>
        <div className="cont">
          <div className="inputcont">
            <label htmlFor="email" className="styled-label">
              Email
            </label>
            <input
              id="email"
              className="input"
              placeholder="Enter your email here"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => setEmailTouched(true)}
            />
            {emailTouched && !isEmailValid && (
              <div className="error-text">Email is required</div>
            )}
          </div>
          <div className="inputcont">
            <label htmlFor="password" className="styled-label">
              Password
            </label>
            <div className="password-container">
              <input
                id="password"
                className="password-input"
                placeholder="Enter your password here"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setPasswordTouched(true)}
              />
              <button className="togbut" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordTouched && !isPasswordValid && (
              <div className="error-text">Password is required</div>
            )}
          </div>
          {error && <div className="error-text">{error}</div>}
          <button
            className={`button ${isFormValid ? "" : "disabled"}`}
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            Login
          </button>
          <div className="loglink">
            <p>
              <Link to="/">Don't have an account</Link>
            </p>
            <p>
              <Link to="/fogpas">Forget password</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
