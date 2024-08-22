import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "./RegistrationForm.css";
import { Formik, Form, Field } from "formik";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiError, setApiError] = useState(null);

  const handleNextStep = (newData, final = false) => {
    if (final) {
      makeRequest(newData);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const makeRequest = async (formData) => {
    const registrationData = {
      schema_name: formData.companyName.toLowerCase().replace(/\s+/g, "-"),
      company_name: formData.companyName,
      user: {
        password1: formData.password,
        password2: formData.confirmPassword,
        email: formData.companyEmail,
      },
      frontend_url: window.location.host,
    };

    try {
      const response = await axios.post(
        "https://fastrav1-production.up.railway.app/register/",
        registrationData
      );
      console.log("Registration response:", response.data);
      setCurrentStep(2);
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      setApiError(
        error.response?.data || { message: "An unexpected error occurred" }
      );
    }
  };

  const steps = [
    <CompanyDetails next={handleNextStep} />,
    <PasswordSetup next={handleNextStep} apiError={apiError} />,
    <ConfirmationStep />,
  ];

  return (
    <div className="registration-container">
      <div className="registration-form-wrapper">{steps[currentStep]}</div>
    </div>
  );
}

const CompanyDetails = ({ next }) => {
  const validateForm = (values) => {
    const errors = {};
    if (!values.companyName) errors.companyName = "Company Name is required";
    if (!values.companyEmail) {
      errors.companyEmail = "Company Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.companyEmail)
    ) {
      errors.companyEmail = "Invalid email address";
    }
    return errors;
  };

  return (
    <Formik
      initialValues={{ companyName: "", companyEmail: "" }}
      onSubmit={next}
      validate={validateForm}
    >
      {({ errors, touched }) => (
        <Form className="registration-form">
          <h2 className="form-title">Register</h2>
          <p className="form-subtitle">Enter your details to register</p>

          <label className="form-label">Company name</label>
          <Field
            className={`form-input ${
              touched.companyName && errors.companyName ? "is-invalid" : ""
            }`}
            name="companyName"
            type="text"
            placeholder="Enter your company name"
          />
          {touched.companyName && errors.companyName && (
            <div className="error-message">{errors.companyName}</div>
          )}

          <label className="form-label">Company email</label>
          <Field
            className={`form-input ${
              touched.companyEmail && errors.companyEmail ? "is-invalid" : ""
            }`}
            name="companyEmail"
            type="email"
            placeholder="Enter your company email"
          />
          {touched.companyEmail && errors.companyEmail && (
            <div className="error-message">{errors.companyEmail}</div>
          )}

          <button className="submit-button" type="submit">
            Continue
          </button>

          <p className="login-link">
            <a href="/login">Already have an account</a>
          </p>
        </Form>
      )}
    </Formik>
  );
};

const PasswordSetup = ({ next, apiError }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = (values) => {
    const errors = {};
    if (!values.password) errors.password = "Password is required";
    if (!values.confirmPassword)
      errors.confirmPassword = "Confirm Password is required";
    if (values.password !== values.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  return (
    <Formik
      initialValues={{ password: "", confirmPassword: "" }}
      onSubmit={(values) => next(values, true)}
      validate={validateForm}
    >
      {({ errors, touched, values }) => (
        <Form className="registration-form">
          <h2 className="form-title">Password</h2>
          <p className="form-subtitle">Create a password for your account</p>

          {apiError && (
            <div className="api-error-message">
              {Object.entries(apiError).map(([key, value]) => (
                <p key={key}>{`${key}: ${value}`}</p>
              ))}
            </div>
          )}

          <label className="form-label">Password</label>
          <div className="password-input-container">
            <Field
              className={`form-input ${
                touched.password && errors.password ? "is-invalid" : ""
              }`}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
            />
            <button
              className="toggle-password-button"
              type="button"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {touched.password && errors.password && (
            <div className="error-message">{errors.password}</div>
          )}

          <ul className="password-criteria">
            <li className={/[A-Z]/.test(values.password) ? "fulfilled" : ""}>
              One Uppercase Letter
            </li>
            <li className={/[a-z]/.test(values.password) ? "fulfilled" : ""}>
              One Lowercase Letter
            </li>
            <li
              className={/[!@#$%^&*]/.test(values.password) ? "fulfilled" : ""}
            >
              One Special Character
            </li>
            <li className={/\d/.test(values.password) ? "fulfilled" : ""}>
              One Number
            </li>
            <li className={values.password.length >= 8 ? "fulfilled" : ""}>
              8 Characters Minimum
            </li>
          </ul>

          <label className="form-label">Confirm Password</label>
          <div className="password-input-container">
            <Field
              className={`form-input ${
                touched.confirmPassword && errors.confirmPassword
                  ? "is-invalid"
                  : ""
              }`}
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
            />
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}

          <button className="submit-button" type="submit">
            Continue
          </button>
        </Form>
      )}
    </Formik>
  );
};

const ConfirmationStep = () => {
  return (
    <div className="confirmation-container">
      <h2 className="confirmation-title">Confirmation</h2>
      <p className="confirmation-message">
        We sent a confirmation link to your email, click on that link to
        proceed.
      </p>
      <button className="confirmation-button">Continue</button>
    </div>
  );
};