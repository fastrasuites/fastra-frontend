import React, { useState } from "react";
import "./RegForm.css";
import { Formik, Form, Field } from "formik";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegForm() {
const [data, setData] = useState({
  userName: "",
  companyName: "",
  databaseName: "", // Add this line
  companyEmail: "",
  password: "",
  confirmPassword: "",
});

const [currentStep, setCurrentStep] = useState(0);

const makeRequest = async (formData) => {
  const registrationData = {
    schema_name: formData.databaseName.toLowerCase().replace(/\s+/g, "-"),
    company_name: formData.companyName,
    user: {
      username: formData.userName,
      password1: formData.password,
      password2: formData.confirmPassword,
      email: formData.companyEmail,
    },
  };

  try {
    const response = await axios.post(
      "https://fastrav1-production.up.railway.app/register/",
      registrationData
    );
    console.log("Registration response:", response.data); // Add this line for debugging
    setData((prev) => ({ ...prev, ...formData }));
    setCurrentStep(2); // Move to StepThree regardless of the response
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    // Handle errors as needed
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
    <StepThree data={data} />,
  ];

  return (
    <div className="fomain">
      <div className="fowrap">{steps[currentStep]}</div>
    </div>
  );
}

const StepOne = (props) => {
  const handleSubmit = async (values) => {
    try {
      await props.next(values);
    } catch (error) {
      console.error("Registration failed:", error);
      // Handle error appropriately
    }
  };

  const validateForm = (values) => {
    const errors = {};
    if (!values.userName) errors.userName = "Username is Required";
    if (!values.companyName) errors.companyName = "Company Name is Required";
    if (!values.databaseName) errors.databaseName = "Database Name is Required";
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
      initialValues={props.data}
      onSubmit={handleSubmit}
      validate={validateForm}
    >
      {({ errors, touched }) => (
        <Form className="fom" method="POST">
          <p className="reg">Register</p>
          <p className="reg1">Enter your details to register</p>
          <p className="lbl">Username</p>
          <Field
            className={
              touched.userName && errors.userName ? "inpt is-invalid" : "inpt"
            }
            name="userName"
            type="name"
            placeholder="Create your username"
          />
          {touched.userName && errors.userName && (
            <div className="error">{errors.userName}</div>
          )}
          <p className="lbl">Company name</p>
          <Field
            className={
              touched.companyName && errors.companyName
                ? "inpt is-invalid"
                : "inpt"
            }
            name="companyName"
            type="name"
            placeholder="Enter your company name"
          />
          {touched.companyName && errors.companyName && (
            <div className="error">{errors.companyName}</div>
          )}
          <p className="lbl">Database name</p>
          <Field
            className={
              touched.databaseName && errors.databaseName
                ? "inpt is-invalid"
                : "inpt"
            }
            name="databaseName"
            type="name"
            placeholder="Enter your database name"
          />
          {touched.databaseName && errors.databaseName && (
            <div className="error">{errors.databaseName}</div>
          )}
          <p className="lbl">Company email</p>
          <Field
            className={
              touched.companyEmail && errors.companyEmail
                ? "inpt is-invalid"
                : "inpt"
            }
            name="companyEmail"
            type="email"
            placeholder="Enter your company email here"
          />
          {touched.companyEmail && errors.companyEmail && (
            <div className="error">{errors.companyEmail}</div>
          )}
          <button className="butn" type="submit">
            Continue
          </button>
          <Link to="/login" className="goin">
            Already have an account?
          </Link>
        </Form>
      )}
    </Formik>
  );
};

const StepTwo = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      number: /\d/.test(password),
      specialCharacter: /[!@#$%^&*]/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
    };
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
      initialValues={props.data}
      onSubmit={(values) => props.next(values, true)}
      validate={validateForm}
    >
      {({ errors, touched, values }) => (
        <Form className="fom2">
          <p className="reg2">Password</p>
          <p className="reg3">Create a password for your account</p>
          <p className="lbl2">Password</p>
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
          <p className="lbl2">Confirm Password</p>
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
            Register
          </button>
        </Form>
      )}
    </Formik>
  );
};

const StepThree = (props) => {
  return (
    <div className="fom4">
      <p className="reg4">Registration Successful</p>
      <p className="cfm">
        Your account has been created successfully. A verification email has
        been sent to {props.data.companyEmail}. Please check your inbox (and
        spam folder) and click on the verification link to activate your
        account.
      </p>
    </div>
  );
};
