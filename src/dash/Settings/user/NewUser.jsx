import React, { useState, useEffect, useRef } from "react";
// import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import Select from "react-select";
import autosave from "../../../image/autosave.svg";
import uploadIcon from "../../../image/uploadIcon.svg";
import "../../../shared/signature.css";
import SignatureCanvas from "react-signature-canvas";

import AccessRight from "./AccessRight";
// import "./newuser.css";

import { useHistory } from "react-router-dom";

const fetchLanguages = async () => {
  const apiKey = "YOUR_GOOGLE_CLOUD_API_KEY"; // Replace with your API key
  const url = `https://translation.googleapis.com/language/translate/v2/languages?key=${apiKey}&target=en`;

  // Fetch company name and email from localStorage on component mount
//  useEffect(() => {
//   const storedData = JSON.parse(localStorage.getItem("registrationData"));
//   if (storedData) {
//     setFormState((prev) => ({
//       ...prev,
//       companyName: storedData.companyName || "",
//       email: storedData.email || "",
//     }));
//   }
// }, []);

// const handleChange = (e) => {
//   const { name, value } = e.target;
//   console.log(`${name}: ${value}`); // Log the field name and value
//   setFormState((prevState) => ({
//     ...prevState,
//     [name]: value,
//   }));
// };



  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data.languages.map((lang) => ({
      value: lang.language,
      label: lang.language,
    }));
  } catch (error) {
    console.error("Error fetching languages:", error);
    return [];
  }
};

const fetchTimezones = async () => {
  const url = `http://worldtimeapi.org/api/timezone`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.map((tz) => ({
      value: tz,
      label: tz,
    }));
  } catch (error) {
    console.error("Error fetching timezones:", error);
    return [];
  }
};

export default function NewUser({ onClose, onSaveAndSubmit, fromStepModal }) {
  const [formState, setFormState] = useState({
    name: "",
    role: "",
    mail: "",
    number: "",
    language: "",
    timezone: "",
    image: null,
    inAppNotification: false,
    emailNotification: false,
  });

  const [showForm] = useState(true);
  const [error, setError] = useState(null);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [timezoneOptions, setTimezoneOptions] = useState([]);
  const [showAccessRight, setShowAccessRight] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      const [languages, timezones] = await Promise.all([
        fetchLanguages(),
        fetchTimezones(),
      ]);
      setLanguageOptions(languages);
      setTimezoneOptions(timezones);
    };

    loadOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormState((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAndSubmit = (formData) => {
    try {
      console.log("Saving form data:", formData); // Debugging statement
      const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
      existingUsers.push(formData);
      localStorage.setItem("users", JSON.stringify(existingUsers));
      onSaveAndSubmit(formData);
    } catch (e) {
      console.error("Save error:", e); // Debugging statement
      if (e.name === "QuotaExceededError") {
        setError("Failed to save user. Storage limit exceeded.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted", formState); // Debugging statement
    handleSaveAndSubmit(formState);
    // if coming through dashboard popup, open AccessRight component and its form.
    if (fromStepModal) {
      setShowAccessRight(true);
    } else {
      // close after form submit
      onClose();
    }
  };

  const Signature = () => {
    const sigCanvas = useRef(null);

    const clearSignature = () => {
      sigCanvas.current.clear();
    };

    const saveSignature = () => {
      if (!sigCanvas.current.isEmpty()) {
        const dataURL = sigCanvas.current
          .getTrimmedCanvas()
          .toDataURL("image/png");
        console.log("Signature saved", dataURL);
        // Here you can save the image dataURL to a file or use it in your backend.
      }
    };

    return (
      <div className="signature-block">
        <div className="signature">
          <div>
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: "400",
                height: "150",
                className: "signature-canvas",
              }}
            />
            <div>
              <button className="signatory-btn" onClick={clearSignature}>
                Clear
              </button>
              <button className="signatory-btn" onClick={saveSignature}>
                Save Signature
              </button>
            </div>
          </div>
          <div>
            <input type="file" accept="image/*" />
            <button className="signatory-btn">Upload Signature</button>
          </div>
        </div>
      </div>
    );
  };

  const roleOptions = [
    { value: "Admin", label: "Administrator" },
    { value: "User", label: "User" },
    { value: "Operator", label: "Operator" },
  ];

  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: "95%",
      marginTop: "0.1rem",
      cursor: "pointer",
      outline: "none",
      border: "2px solid #e2e6e9",
      borderRadius: "4px",
      padding: "5px",
      marginBottom: "1rem",
    }),
    menu: (provided) => ({
      ...provided,
      width: "95%",
    }),
    menuList: (provided) => ({
      ...provided,
      width: "95%",
    }),
    option: (provided) => ({
      ...provided,
      cursor: "pointer",
    }),
  };

  return (
    <div
      id="newuser"
      className={`registration-page ${showForm ? "fade-in" : "fade-out"}`}
    >
      -
      <div className="form-header" style={{ marginTop: "3rem" }}>
        <div className="form-header-details">
          <div className="form-header-activity">
            {!showAccessRight && <h2 className="header-text"> New User</h2>}
            <div className="autosave" style={{ marginLeft: "18px" }}>
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
        </div>
        <div className="settings">
          <button
            className="nutogclk"
            onClick={() => setShowAccessRight(false)}
          >
            Basic Setting
          </button>
          <button
            className="access-btn"
            onClick={() => setShowAccessRight(true)}
          >
            Access Right
          </button>
        </div>
        {showAccessRight ? (
          <div className="newuser3">
            <AccessRight
              handleSubmit={handleSubmit}
              fromStepModal={fromStepModal}
              onClose={onClose}
            />
          </div>
        ) : (
          <div className="registration-form">
            <form className="registration-info" onSubmit={handleSubmit}>
              <div className="registration-header-info">
                <h2 style={{ fontSize: "20px", marginTop: "3%" }}>
                  Basic Information
                </h2>
                <div className="reg-action-btn">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className="registration-basic-info">
                <div className="newuser3ba">
                  <div
                    className="image-upload"
                    onClick={() =>
                      document.getElementById("imageInput").click()
                    }
                  >
                    <input
                      type="file"
                      accept=".png, .jpg, .jpeg"
                      onChange={handleImageChange}
                      id="imageInput"
                      name="image"
                      style={{ display: "none" }}
                      required
                    />
                    {formState.image ? (
                      <img
                        src={formState.image}
                        alt="Preview"
                        className="image-preview"
                      />
                    ) : (
                      <div className="image-upload-text">
                        <img src={uploadIcon} alt="Upload" />
                        <span style={{ fontSize: "10px" }}>
                          Click to upload
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="FirstName LastName"
                    className="form-control"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <Select
                    options={roleOptions}
                    name="role"
                    styles={customStyles}
                    value={roleOptions.find(
                      (option) => option.value === formState.role
                    )}
                    onChange={(selectedOption) =>
                      setFormState((prev) => ({
                        ...prev,
                        role: selectedOption ? selectedOption.value : "",
                      }))
                    }
                  />
                </div>
              </div>
              <hr />
              <div className="registration-contact-info">
                <h2 style={{ fontSize: "20px" }}>Contact Information</h2>
              </div>
              <div className="registration-contact-info-grouped">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="text"
                    name="mail"
                    placeholder="Enter your company email address"
                    className="form-control"
                    value={formState.mail}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="number"
                    placeholder="Enter your company phone number"
                    className="form-control"
                    value={formState.number}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <hr />
              <div className="registration-contact-info">
                <h2 style={{ fontSize: "20px" }}>Companies</h2>
              </div>
              <div className="registration-contact-info-grouped">
                <div className="form-group">
                  <label>Company name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="company.fastrasuite.com"
                    value={formState.companyName}
                    onChange={handleChange}
                    disabled 
                  />
                </div>
              </div>
              <hr />
              <div className="registration-contact-info">
                <h2 style={{ fontSize: "20px" }}>Preferences</h2>
              </div>
              <div className="registration-contact-info-grouped">
                <div className="form-group">
                  <label>Language</label>
                  <Select
                    options={languageOptions}
                    name="language"
                    styles={customStyles}
                    className="select-box"
                    value={languageOptions.find(
                      (option) => option.value === formState.language
                    )}
                    onChange={(selectedOption) =>
                      setFormState((prev) => ({
                        ...prev,
                        language: selectedOption ? selectedOption.value : "",
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <Select
                    options={timezoneOptions}
                    name="timezone"
                    styles={customStyles}
                    value={timezoneOptions.find(
                      (option) => option.value === formState.timezone
                    )}
                    onChange={(selectedOption) =>
                      setFormState((prev) => ({
                        ...prev,
                        timezone: selectedOption ? selectedOption.value : "",
                      }))
                    }
                    menuPlacement="auto"
                  />
                </div>
              </div>
              <h3 style={{ fontWeight: "490", color: "#000", width: "100%" }}>
                Notifications
              </h3>
              <br />
              <div className="registration-contact-info">
                <div className="checkbox-group" style={{ lineHeight: "2rem" }}>
                  <div className="checkbox" style={{display: "flex", alignItems: "center", justifyContent: "space-around"}}>
                    <label>In-app notification </label>
                    <input
                      type="checkbox"
                      name="inAppNotification"
                      checked={formState.inAppNotification}
                      onChange={handleChange}
                      style={{ marginLeft: "4rem"}}
                    />
                  </div>
                  <div className="checkbox" style={{display: "flex", alignItems: "center", justifyContent: "space-around"}}>
                    <label>Email notification </label>
                    <input
                      type="checkbox"
                      name="emailNotification"
                      checked={formState.emailNotification}
                      onChange={handleChange}
                      style={{ marginLeft: "4rem" }}
                    />
                  </div>
                </div>
              </div>
              <br />
              <hr />
              <br />
              <br />
              <br />
              <h2
                style={{
                  color: "#4285f4",
                  marginBottom: "30px",
                  fontWeight: "500",
                }}
              >
                Signature
              </h2>
              <Signature />
              <br />
              {/* shows only on mobile devices */}
              <div className="reg-action-btn" id="reg-action-btn">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
