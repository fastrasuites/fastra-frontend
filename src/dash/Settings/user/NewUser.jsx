import React, { useState, useEffect } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import Select from "react-select";
import autosave from "../../../image/autosave.svg";
import uploadIcon from "../../../image/uploadIcon.svg"; // Ensure to have this icon in your project

import AccessRight from "./AccessRight";
import "./newuser.css";

const fetchLanguages = async () => {
  const apiKey = "YOUR_GOOGLE_CLOUD_API_KEY"; // Replace with your API key
  const url = `https://translation.googleapis.com/language/translate/v2/languages?key=${apiKey}&target=en`;

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

export default function NewUser({ onClose, onSaveAndSubmit }) {
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
    onClose();
  };

  const roleOptions = [
    { value: "Admin", label: "Administrator" },
    { value: "Usr", label: "User" },
    { value: "Opr", label: "Operator" },
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
      className={`newuser ${showForm ? "fade-in" : "fade-out"}`}
    >
      <div className="newuser1">
        <div className="newuser2">
          <div className="newuser2a">
            {!showAccessRight && <p className="newuserhed"> New User</p>}
            <div className="newuserauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
          <div className="newuser2b">
            <div className="newuserbnav">
              <FaCaretLeft className="nr" />
              <div className="sep"></div>
              <FaCaretRight className="nr" />
            </div>
          </div>
        </div>
        <div className="newuserclk">
          <button
            className="nutogclk"
            onClick={() => setShowAccessRight(false)}
          >
            Basic Setting
          </button>
          <button className="nutogclk" onClick={() => setShowAccessRight(true)}>
            Access Right
          </button>
        </div>
        {showAccessRight ? (
          <div className="newuser3">
            <AccessRight handleSubmit={handleSubmit} />
          </div>
        ) : (
          <div className="newuser3">
            <form className="newuserform" onSubmit={handleSubmit}>
              <div className="newuser3a">
                <p style={{ fontSize: "20px" }}>Basic Information</p>
                <div className="newuser3e">
                  <button
                    type="button"
                    className="newuser3but"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="newuser3btn"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className="newuser3b">
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
                <div className="newuser3ba">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="FirstName LastName"
                    className="newuser3cb"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="newuser3ba">
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

              <div className="newuser3a2">
                <p style={{ fontSize: "20px" }}>Contact Information</p>
              </div>
              <div className="newuser3d">
                <div className="newuser3da">
                  <label>Email</label>
                  <input
                    type="text"
                    name="mail"
                    placeholder="Enter your company email address"
                    className="newuser3cb"
                    value={formState.mail}
                    onChange={handleChange}
                  />
                </div>
                <div className="newuser3da">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="number"
                    placeholder="Enter your company phone number"
                    className="newuser3cb"
                    value={formState.number}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="newuser3a2">
                <p style={{ fontSize: "20px" }}>Companies</p>
              </div>
              <div className="newuser3f">
                <p>Company name</p>
                <button
                  className="newuser3btn"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  Add Company
                </button>
              </div>

              <div className="newuser3a2">
                <p style={{ fontSize: "20px" }}>Preference</p>
              </div>
              <div className="newuser3d2">
                <div className="newuser3da">
                  <label>Language</label>
                  <Select
                    options={languageOptions}
                    name="language"
                    styles={customStyles}
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
                <div className="newuser3da">
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
              <div className="newuser3g">
                <p style={{ fontWeight: "bold" }}>Notification</p>
                <div className="checkbox-group" style={{ lineHeight: "2rem" }}>
                  <div className="checkbox">
                    <label>In-app notification</label>
                    <input
                      type="checkbox"
                      name="inAppNotification"
                      checked={formState.inAppNotification}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="checkbox">
                    <label>Email notification</label>
                    <input
                      type="checkbox"
                      name="emailNotification"
                      checked={formState.emailNotification}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
