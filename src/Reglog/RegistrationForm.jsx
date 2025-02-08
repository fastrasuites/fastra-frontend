import React, { useState } from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import "./RegistrationForm.css";
import { Link } from "react-router-dom";

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = (newData, final = false) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    if (final) {
      makeRequest({ ...formData, ...newData });
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const makeRequest = async (finalData) => {
    const registrationData = {
      company_name: finalData.companyName,
      user: {
        password1: finalData.password,
        password2: finalData.confirmPassword,
        email: finalData.companyEmail,
      },
    };

    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://www.fastrasuiteapi.com.ng/register/",
        registrationData
      );
      console.log("Registration response:", response.data);
      localStorage.setItem(
        "registrationData",
        JSON.stringify(registrationData)
      );
      setCurrentStep(2);
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      setApiError(
        error.response?.data || { message: "An unexpected error occurred" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    <CompanyDetails next={handleNextStep} formData={formData} />,
    <PasswordSetup
      next={handleNextStep}
      previous={handlePreviousStep}
      apiError={apiError}
      isLoading={isLoading}
      formData={formData}
      showBackButton={!!formData.companyName && !!formData.companyEmail}
    />,
    <ConfirmationStep
      companyEmail={formData.companyEmail}
      isLoading={isLoading}
    />,
  ];

  return (
    <div className="registration-container">
      <div className="registration-form-wrapper">{steps[currentStep]}</div>
    </div>
  );
}

const CompanyDetails = ({ next, formData }) => {
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
      initialValues={{
        companyName: formData.companyName || "",
        companyEmail: formData.companyEmail || "",
      }}
      onSubmit={(values) => next(values)}
      validate={validateForm}
    >
      {({ errors, touched }) => (
        <Form className="reg-form">
          <div className="f-group">
            <h2 className="form-title">Register</h2>
            <p className="form-subtitle">Enter your details to register</p>

            <div className="sub-group">
              <div>
                <label className="form-label" htmlFor="companyName">
                  Company name
                </label>
                <Field
                  className={`form-input ${
                    touched.companyName && errors.companyName
                      ? "is-invalid"
                      : ""
                  }`}
                  name="companyName"
                  id="companyName"
                  type="text"
                  placeholder="Enter your company name"
                />
                {touched.companyName && errors.companyName && (
                  <div className="error-message">{errors.companyName}</div>
                )}
                <p className="company-name-example">
                  companyname.fastrasuites.com
                </p>
              </div>

              <div>
                <label className="form-label" htmlFor="companyEmail">
                  Company email
                </label>
                <Field
                  className={`form-input ${
                    touched.companyEmail && errors.companyEmail
                      ? "is-invalid"
                      : ""
                  }`}
                  name="companyEmail"
                  id="companyEmail"
                  type="email"
                  placeholder="Enter your company email"
                />
                {touched.companyEmail && errors.companyEmail && (
                  <div className="error-message">{errors.companyEmail}</div>
                )}
              </div>
            </div>
          </div>
          <button className="submit-button" type="submit">
            Continue
          </button>

          <p className="login-link">
            {/* <a href="/login">Already have an account</a> */}
            <Link to="/login">Already have an account</Link>
          </p>
        </Form>
      )}
    </Formik>
  );
};

const PasswordSetup = ({
  next,
  previous,
  apiError,
  isLoading,
  formData,
  showBackButton,
}) => {
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
      initialValues={{
        password: formData.password || "",
        confirmPassword: formData.confirmPassword || "",
      }}
      onSubmit={(values) => next(values, true)}
      validate={validateForm}
    >
      {({ errors, touched, values }) => (
        <Form className="reg-form">
          {/* {showBackButton && (
            <div className="back-button-container">
              <p className="go-back-link" onClick={previous}>
                <FaArrowLeft /> Go Back
              </p>
            </div>
          )} */}
          <h2 className="form-title">Password</h2>
          <p className="form-subtitle">Create a password for your account</p>

          {apiError && (
            <div className="api-error-message">
              {Object.entries(apiError).map(([key, value]) => (
                <p key={key}>
                  {`${key}: ${value}`} -{" "}
                  <span className="go-back-link" onClick={previous}>
                    {/* <FaArrowLeft />  */}
                    Go Back
                  </span>
                </p>
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

          <button className="submit-button" type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Submit"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

const ConfirmationStep = ({ companyEmail, isLoading }) => {
  const handleOpenEmailClient = () => {
    if (!companyEmail) {
      alert("No email found. Please check your registration.");
      return;
    }

    const emailDomain = companyEmail.split("@")[1];

    const emailProviders = {
      "gmail.com": "https://mail.google.com",
      "yahoo.com": "https://mail.yahoo.com",
      "outlook.com": "https://outlook.live.com",
      "hotmail.com": "https://outlook.live.com",
      "aol.com": "https://mail.aol.com",
      "icloud.com": "https://www.icloud.com/mail",
      "mail.com": "https://www.mail.com",
      "zoho.com": "https://mail.zoho.com",
      "protonmail.com": "https://mail.protonmail.com",
      "gmx.com": "https://www.gmx.com",
      "yandex.com": "https://mail.yandex.com",
      "qq.com": "https://mail.qq.com",
      "naver.com": "https://mail.naver.com",
      "163.com": "https://mail.163.com",
      "126.com": "https://mail.126.com",
      "rediffmail.com": "https://mail.rediff.com",
    };

    if (emailProviders[emailDomain]) {
      window.open(emailProviders[emailDomain], "_blank");
    } else {
      alert(
        `The email provider (${emailDomain}) is not recognized. Please open your email manually.`
      );
    }
  };
  return (
    <div className="confirmation-container">
      <h2 className="confirmation-title">Confirmation</h2>
      <p className="confirmation-message">
        We sent a confirmation link to your email. Click the "Continue" button
        to open your email client and retrieve the token.
      </p>
      <button className="confirmation-button" onClick={handleOpenEmailClient}>
        {isLoading ? "Processing..." : "Continue"}
      </button>
    </div>
  );
};
