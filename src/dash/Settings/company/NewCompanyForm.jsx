import React, { useState } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import Select from "react-select";
import autosave from "../../../image/autosave.svg";
import uploadIcon from "../../../image/uploadIcon.svg";
import "./NewCompanyForm.css";
import { useHistory } from "react-router-dom";

export default function NewCompany({
  onClose,
  onSaveAndSubmit,
  fromStepModal,
}) {
  const [formState, setFormState] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    website: "",
    street: "",
    localGovernment: "",
    state: "",
    country: "",
    registrationNumber: "",
    taxId: "",
    currency: "",
    industry: "",
    language: "",
    size: "",
    image: "", // Add image field here
  });

  const [showForm] = useState(true);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormState((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
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

  const history = useHistory();

  const handleSubmit = (e) => {
    console.log("submitted");
    e.preventDefault();
    onSaveAndSubmit(formState);

    onClose();
    if (fromStepModal) {
      history.push({ pathname: "./dashboard", state: { step: 2 } });
    } else {
      // Handle form submission without navigating
      console.log("Form submitted without navigating.");
    }
  };

  const currencyOptions = [
    { value: "USD", label: "USD" },
    // Add more options as needed
  ];

  const industryOptions = [
    { value: "technology", label: "Technology" },
    // Add more options as needed
  ];

  const languageOptions = [
    { value: "english", label: "English" },
    // Add more options as needed
  ];

  const sizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
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
      id="newcompany"
      className={`newcompany ${showForm ? "fade-in" : "fade-out"}`}
    >
      <div className="newcompany1">
        <div className="newcompany2">
          <div className="newcompany2a">
            <p className="newcompanyhed">New Company</p>
            <div className="newcompanyauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
          <div className="newcompany2b">
            <div className="newcompanybnav">
              <FaCaretLeft className="nr" />
              <div className="sep"></div>
              <FaCaretRight className="nr" />
            </div>
          </div>
        </div>

        <div className="newcompany3">
          <form className="newcompanyform" onSubmit={handleSubmit}>
            <div className="newcompany3a">
              <p style={{ fontSize: "20px" }}>Basic Information</p>
              <div className="newcompany3e">
                <button
                  type="button"
                  className="newcompany3but"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="newcompany3btn"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  Save
                </button>
              </div>
            </div>
            <div className="newcompany3b">
              <div className="newuser3ba">
                <div
                  className="image-upload"
                  onClick={() => document.getElementById("imageInput").click()}
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
                      <span style={{ fontSize: "10px" }}>Click to upload</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="newcompany3ba">
                <label>Company name</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Enter your company name"
                  className="newcompany3cb"
                  value={formState.companyName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="newcompany3a2">
              <p style={{ fontSize: "20px" }}>Contact Information</p>
            </div>
            <div className="newcompany3d">
              <div className="newcompany3da">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your company email address"
                  className="newcompany3cb"
                  value={formState.email}
                  onChange={handleChange}
                />
              </div>
              <div className="newcompany3da">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter your company phone number"
                  className="newcompany3cb"
                  value={formState.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="newcompany3da">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  placeholder="Enter your company website URL"
                  className="newcompany3cb"
                  value={formState.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="newcompany3d">
              <div className="newcompany3da">
                <label>Street & Number</label>
                <input
                  type="text"
                  name="street"
                  placeholder="Enter street and number"
                  className="newcompany3cb"
                  value={formState.street}
                  onChange={handleChange}
                />
              </div>
              <div className="newcompany3da">
                <label>Local Government</label>
                <input
                  type="text"
                  name="localGovernment"
                  placeholder="Enter local government"
                  className="newcompany3cb"
                  value={formState.localGovernment}
                  onChange={handleChange}
                />
              </div>
              <div className="newcompany3da">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Enter state"
                  className="newcompany3cb"
                  value={formState.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="newcompany3b">
              <div className="newcompany3ba">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  placeholder="Enter country"
                  className="newcompany3cb"
                  value={formState.country}
                  onChange={handleChange}
                />
              </div>
              <div className="newcompany3ba">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  placeholder="Enter registration number"
                  className="newcompany3cb"
                  value={formState.registrationNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="newcompany3ba">
                <label>Tax Identification Number (TIN)</label>
                <input
                  type="text"
                  name="taxId"
                  placeholder="Enter tax ID"
                  className="newcompany3cb"
                  value={formState.taxId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="newcompany3a2">
              <p style={{ fontSize: "20px" }}>Additional Information</p>
            </div>

            <div className="newcompany3d">
              <div className="newcompany3da">
                <label>Currency</label>
                <Select
                  name="currency"
                  options={currencyOptions}
                  styles={customStyles}
                  onChange={(selectedOption) =>
                    handleSelectChange("currency", selectedOption)
                  }
                />
              </div>
              <div className="newcompany3da">
                <label>Industry</label>
                <Select
                  name="industry"
                  options={industryOptions}
                  styles={customStyles}
                  onChange={(selectedOption) =>
                    handleSelectChange("industry", selectedOption)
                  }
                />
              </div>
              <div className="newcompany3da">
                <label>Language</label>
                <Select
                  name="language"
                  options={languageOptions}
                  styles={customStyles}
                  onChange={(selectedOption) =>
                    handleSelectChange("language", selectedOption)
                  }
                />
              </div>
            </div>
            <div className="newcompany3da">
              <label>Company Size</label>
              <Select
                name="size"
                options={sizeOptions}
                styles={customStyles}
                onChange={(selectedOption) =>
                  handleSelectChange("size", selectedOption)
                }
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
