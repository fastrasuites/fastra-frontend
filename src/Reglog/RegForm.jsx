import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "./RegForm.css";
import { Formik, Form, Field } from "formik";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegForm() {
  const [data, setData] = useState({
    userName: "",
    companyName: "",
    companyEmail: "",
    password: "",
    confirmPassword: "",
    frontend_url: window.location.host,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const makeRequest = async (formData) => {
    // Log formData to check values
    console.log("Form data to be sent:", formData);

    const registrationData = {
      schema_name: formData.companyName.toLowerCase().replace(/\s+/g, "-"),
      company_name: formData.companyName,
      user: {
        username: formData.userName,
        password1: formData.password,
        password2: formData.confirmPassword,
        email: formData.companyEmail,
      },
      frontend_url:formData.frontend_url,
    };

    try {
      const response = await axios.post(
        "https://fastrav1-production.up.railway.app/register/",
        registrationData
      );
      console.log("Registration response:", response.data);
      setData((prev) => ({ ...prev, ...formData }));
      setCurrentStep(2);
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
    }
  };

  const handleNextStep = (newData, final = false) => {
    setData((prev) => ({ ...prev, ...newData }));

    if (final) {
      makeRequest(newData);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const steps = [
    <StepOne next={handleNextStep} data={data} />,
    <StepTwo next={handleNextStep} data={data} />,
    <StepThree />,
  ];

  return (
    <div className="fomain">
      <div className="fowrap">{steps[currentStep]}</div>
    </div>
  );
}

// StepOne Component - User and Company Details
const StepOne = ({ next, data }) => {
  const handleSubmit = async (values) => {
    try {
      await next(values);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const validateForm = (values) => {
    const errors = {};
    if (!values.userName) errors.userName = "Username is Required";
    if (!values.companyName) errors.companyName = "Company Name is Required";
    if (!values.companyEmail) {
      errors.companyEmail = "Company Email is Required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.companyEmail)
    ) {
      errors.companyEmail = "Invalid email address";
    }
    return errors;
  };

  return (
    <Formik
      initialValues={data}
      onSubmit={handleSubmit}
      validate={validateForm}
    >
      {({ errors, touched }) => (
        <Form className="fom" method="POST">
          <p className="reg">Register</p>
          <p className="reg1">Enter your details to register</p>
          <label className="lbl">Username</label>
          <Field
            className={
              touched.userName && errors.userName ? "inpt is-invalid" : "inpt"
            }
            name="userName"
            type="text"
            placeholder="Create your username"
          />
          {touched.userName && errors.userName && (
            <div className="error">{errors.userName}</div>
          )}
          <label className="lbl">Company Name</label>
          <Field
            className={
              touched.companyName && errors.companyName
                ? "inpt is-invalid"
                : "inpt"
            }
            name="companyName"
            type="text"
            placeholder="Enter your company name"
          />
          {touched.companyName && errors.companyName && (
            <div className="error">{errors.companyName}</div>
          )}
          <label className="lbl">Company Email</label>
          <Field
            className={
              touched.companyEmail && errors.companyEmail
                ? "inpt is-invalid"
                : "inpt"
            }
            name="companyEmail"
            type="email"
            placeholder="Enter your company email"
          />
          {touched.companyEmail && errors.companyEmail && (
            <div className="error">{errors.companyEmail}</div>
          )}
          <button className="butn" type="submit">
            Continue
          </button>
        </Form>
      )}
    </Formik>
  );
};

const StepTwo = ({ next, data }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = (values) => {
    const errors = {};

    if (!values.password) errors.password = "Password is Required";
    else if (values.password.length < 8)
      errors.password = "Password must be at least 8 characters";
    else if (!/[0-9]/.test(values.password))
      errors.password = "Password must contain at least one number";
    else if (!/[!@#$%^&*]/.test(values.password))
      errors.password = "Password must contain at least one special character";
    else if (!/[a-z]/.test(values.password))
      errors.password = "Password must contain at least one lowercase letter";
    else if (!/[A-Z]/.test(values.password))
      errors.password = "Password must contain at least one uppercase letter";

    if (!values.confirmPassword)
      errors.confirmPassword = "Confirm Password is Required";
    else if (values.password !== values.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    return errors;
  };

  return (
    <Formik
      initialValues={data}
      onSubmit={(values) => next(values, true)}
      validate={validateForm}
    >
      {({ errors, touched, values }) => (
        <Form className="fom2">
          <p className="reg2">Password</p>
          <p className="reg3">Create a password for your account</p>
          <label className="lbl2">Password</label>
          <Field
            className={
              touched.password && errors.password ? "inpt1 is-invalid" : "inpt1"
            }
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter password"
          />
          <button
            className="togbutn"
            type="button"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {touched.password && errors.password && (
            <div className="error">{errors.password}</div>
          )}
          <ul className="password-criteria">
            <li className={values.password.length >= 8 ? "fulfilled" : ""}>
              At least 8 characters
            </li>
            <li className={/\d/.test(values.password) ? "fulfilled" : ""}>
              At least one number
            </li>
            <li
              className={/[!@#$%^&*]/.test(values.password) ? "fulfilled" : ""}
            >
              At least one special character
            </li>
            <li className={/[a-z]/.test(values.password) ? "fulfilled" : ""}>
              At least one lowercase letter
            </li>
            <li className={/[A-Z]/.test(values.password) ? "fulfilled" : ""}>
              At least one uppercase letter
            </li>
          </ul>
          <label className="lbl2">Confirm Password</label>
          <Field
            className={
              touched.confirmPassword && errors.confirmPassword
                ? "inpt1 is-invalid"
                : "inpt1"
            }
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <div className="error">{errors.confirmPassword}</div>
          )}
          <button className="butn2" type="submit">
            Continue
          </button>
        </Form>
      )}
    </Formik>
  );
};

const StepThree = () => {
  return (
    <div className="success">
      <h2>Registration Successful!</h2>
      <p>A confirmation email has been sent to your provided email address.</p>
      <p>Please click the link in the email to verify your account.</p>
    </div>
  );
};

// New Component for Email Verification Success Page
const EmailVerification = () => {
  const history = useHistory();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = new URLSearchParams(window.location.search).get("token");

        if (!token) {
          console.error("Token not found in URL");
          return;
        }

        const response = await axios.get(
          "https://fastrav1-production.up.railway.app/email-verify/",
          { params: { token } }
        );
        console.log("Email verification response:", response.data);
        setTimeout(() => {
          history.push("/login");
        }, 3000); // Redirect after 3 seconds
      } catch (error) {
        console.error(
          "Email verification error:",
          error.response?.data || error.message
        );
      }
    };

    verifyEmail();
  }, [history]);

  return (
    <div className="verification">
      <h2>Email Verification</h2>
      <p>
        Your email has been verified successfully. You will be redirected to the
        login page shortly.
      </p>
    </div>
  );
};
