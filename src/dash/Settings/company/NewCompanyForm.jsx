import React, { useState } from "react";
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
    image: "",
  });

  const [roles, setRoles] = useState([]); // State to manage the list of roles
  const [currentRole, setCurrentRole] = useState(""); // State to manage the current input for the role
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(true); // State to control form visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
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
    console.log("submitted");
    e.preventDefault();
    onSaveAndSubmit(formState);
    onClose();
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
      className={`registration-page ${showForm ? "fade-in" : "fade-out"}`}
    >
      <div className="form-header">
        <div className="form-header-details">
          <div className="form-header-activity">
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
                  className="form-control"
                  placeholder="Enter your company name"
                  value={formState.companyName}
                  onChange={handleChange}
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
                  className="form-control"
                  name="email"
                  placeholder="Enter your company email address"
                  value={formState.email}
                  onChange={handleChange}
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
                />
              </div>
            </div>
              <hr />
             {/* registration contact info */}
          
          <div className="registration-contact-info">
              <h2>Other Information</h2>
            </div>
            <div className="registration-contact-info-grouped">
              <div className="form-group">
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
              </div>
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
                />
              </div>
            </div>
            <div className="registration-contact-info-grouped" id="size">
              <div className="form-group" >
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
                />
              </div>
            </div> 
          
            <hr />
            {/* Role input and display section */}
            <div className="registration-role-grouped">
              <h2>Roles</h2>
              <label style={{fontSize: "18px", fontWeight: "400"}}>Input your Role</label>
           <div className="form-group">
           
           <div className="role-groped">
              <input
                  type="text"
                  placeholder="Enter a role"
                  className="form-control"
                  value={currentRole}
                  onChange={handleRoleInputChange}
                /></div>
                 <div className="add-role-button">
                 <button type="button" onClick={addRole} className="add-role-btn">
                  <span className="plus-icon">+</span> 
                    <span className="text">&nbsp; &nbsp; Add More Roles</span>
                  </button>
                   </div>
               
              
            </div>
              {/* Display list of added roles */}
              <ul className="role-list">
                {roles.map((role, index) => (
                  <li key={index} className="role-item">
                    {role}
                  </li>
                ))}
              </ul>
            </div>
            {/* only on mobile submit button */}

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
      </div>
    </div>
  );
}
