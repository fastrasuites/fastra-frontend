import React, { useState, useEffect } from "react";
import Select from "react-select";
import autosave from "../../../image/autosave.svg";
import uploadIcon from "../../../image/uploadIcon.svg";
import { useHistory } from "react-router-dom";
import { boxSizing } from "@mui/system";

export default function NewCompany({ onClose, onSaveAndSubmit, fromStepModal }) {
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
    image: "",
  });
  const [isEditable, setIsEditable] = useState(false); // State to control if fields are editable
  const [roles, setRoles] = useState([]); // State to manage the list of roles
  const [currentRole, setCurrentRole] = useState(""); // State to manage the current input for the role
  const [showForm, setShowForm] = useState(true); // State to control form visibility

  // Fetch company name and email from localStorage on component mount
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("registrationData"));
    if (storedData) {
      setFormState((prev) => ({
        ...prev,
        companyName: storedData.companyName || "",
        email: storedData.email || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`${name}: ${value}`); // Log the field name and value
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  

  const handleRoleInputChange = (e) => {
    setCurrentRole(e.target.value);
  };

  const addRole = () => {
    if (currentRole.trim() !== "") {
      setRoles([...roles, currentRole.trim()]); // Add the current role to the roles list
      setCurrentRole(""); // Clear the input field after adding
    }
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
    e.preventDefault();
    onSaveAndSubmit(formState);
    onClose();

    // Detect if true a user came from dashboard popup, then navigate back for the next step
    if (fromStepModal) {
      history.push({ pathname: "/dashboard", state: { step: 2 } });
    }
  };

  const handleEditClick = () => {
    setIsEditable(true); // Enable the fields on Edit button click
  };
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
      id="newcompany" style={{margin: "0"}}
      className={`registration-page ${showForm ? "fade-in" : "fade-out"}`}
    >
      <div className="form-header" style={{width: "100%", overflowY: "none", boxSizing: "border-box", margin: "0"}}>
        <div className="form-header-details">
          <div className="form-header-activity" style={{ marginBottom: "10px"}}>
            <h2 className="header-text">New Company</h2>
            <div className="autosave">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
        </div>

        <div className="registration-form">
          <form className="registration-info" onSubmit={handleSubmit}>
            <div className="registration-header-info">
              <h2>Basic Information</h2>
              <div className="reg-action-btn">
                <button type="button" className="cancel-btn" onClick={handleEditClick}>
                  Edit
                </button>
                <button
                  type="submit"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  Save
                </button>
              </div>
            </div>
            {/* Basic info details */}
            <div className="registration-basic-info">
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
                      <span>
                        Click to Upload <br /> Company Logo
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Company name</label>
                <input
                  type="text"
                  style={{border: "none", backgroundColor: "#fff"}}
                  className="form-control"
                  placeholder="company.fastrasuite.com"
                  name="companyName"
                  value={formState.companyName}
                  onChange={handleChange}
                  disabled // Disable the input field for company name
                />
              </div>
            </div>
            <hr />
            {/* Registration contact info */}
            <div className="registration-contact-info">
              <h2>Contact Information</h2>
            </div>
            <div className="registration-contact-info-grouped">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  style={{border: "none", backgroundColor: "#fff"}}
                  className="form-control"
                  placeholder="company email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="form-control"
                  placeholder="Enter your company phone number"
                  value={formState.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  className="form-control"
                  placeholder="Enter your company website URL"
                  value={formState.website}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: "30px",
                marginBottom: "10px",
                fontSize: "20px",
              }}
            >
              <label>Address</label>
            </div>
            <div className="registration-contact-info-grouped">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  name="street"
                  placeholder="Street & Number"
                  value={formState.street}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  name="localGovernment"
                  placeholder="Local Government"
                  value={formState.localGovernment}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="state"
                  className="form-control"
                  placeholder="State"
                  value={formState.state}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>
            </div>

            <div className="registration-contact-info-grouped">
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  className="form-control"
                  value={formState.country}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>
            </div>
            {/* Company registration info */}
            <hr />
            <div className="registration-contact-info">
              <h2>Company Registration Info</h2>
            </div>
            <div className="registration-contact-info-grouped">
              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  placeholder="Enter registration number"
                  className="form-control"
                  value={formState.registrationNumber}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>
              <div className="form-group">
                <label>Tax ID</label>
                <input
                  type="text"
                  name="taxId"
                  placeholder="Enter Tax ID"
                  className="form-control"
                  value={formState.taxId}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>
            </div>
            <hr />
            {/* registration contact info */}

            <div className="registration-contact-info">
              <h2>Other Information</h2>
            </div>
            <div className="registration-contact-info-grouped">
              {/* <div className="form-group">
                <label>Currency</label>
                <Select
                  name="currency"
                  className="form-control"
                  options={currencyOptions}
                  styles={customStyles}
                  onChange={(selectedOption) =>
                    handleSelectChange("currency", selectedOption)
                  }
                />
              </div> */}
              <div className="form-group">
                <label>Industry</label>
                <Select
                  name="industry"
                  placeholder="Select your industry"
                  className="form-control"
                  options={industryOptions}
                  styles={customStyles}
                  onChange={(selectedOption) =>
                    handleSelectChange("industry", selectedOption)
                  }
                  disabled={!isEditable}
                />
              </div>
              <div className="form-group">
                <label>Laguage</label>
                <Select
                  name="language"
                  placeholder="Select a language"
                  className="form-control"
                  options={languageOptions}
                  styles={customStyles}
                  onChange={(selectedOption) =>
                    handleSelectChange("language", selectedOption)
                  }
                  disabled={!isEditable}
                />
              </div>
              <div className="form-group">
                <label>Size</label>
                <Select
                  name="size"
                  placeholder="Select your company size"
                  className="form-control"
                  options={sizeOptions}
                  styles={customStyles}
                  onChange={(selectedOption) =>
                    handleSelectChange("size", selectedOption)
                  }
                  disabled={!isEditable}
                />
              </div>
            </div>

            <hr />
            {/* Role input and display section */}
            <div className="registration-role-grouped">
  <h2>Roles</h2>
  <div className="form-group">
    <label>Add a Role</label>
    <input
      type="text"
      className="form-control"
      placeholder="Enter a role"
      value={currentRole}
      onChange={handleRoleInputChange}
      disabled={!isEditable}
    />
    <button type="button" onClick={addRole} disabled={!isEditable}>
      Add Role
    </button>
  </div>

  {roles.length > 0 && (
    <div className="roles-list">
      <h3>Assigned Roles</h3>
      <ul>
        {roles.map((role, index) => (
          <li key={index}>{role}</li>
        ))}
      </ul>
    </div>
  )}
</div>

<hr />

{/* Submission Section */}
<div className="form-group">
  <button
    type="submit"
    className="submit-btn"
    style={{ marginTop: "20px" }}
  >
    Save and Submit
  </button>
</div>
</form>
</div>
</div>
</div>
);
}
