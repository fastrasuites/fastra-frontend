import React, { useState, useEffect } from "react";
import Select from "react-select";
import uploadIcon from "../../../image/uploadIcon.svg";
import { Table } from 'react-bootstrap';
import { useHistory } from "react-router-dom";
import '../accessgroups/accessgroups.css';

export default function NewAccessGroup({ onClose, onSaveAndSubmit }) {

  const [formState, setFormState] = useState({
    groupName: "",
    application: "",
    image: "",
    companyName: "PUR-MGR-1023", // Default company name
  });

  const [accessRights, setAccessRights] = useState({
    purchaseRequest: { view: false, edit: false, approve: false },
    purchaseOrder: { view: false, edit: false, approve: false },
    sendRFQ: { view: false, edit: false, approve: false },
    product: { view: false, edit: false, approve: false },
    vendorInfo: { view: false, edit: false, approve: false },
  });

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

  const handleCheckboxChange = (right, field) => {
    setAccessRights((prevRights) => ({
      ...prevRights,
      [right]: {
        ...prevRights[right],
        [field]: !prevRights[right][field],
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Capture the current date and time as dateOfCreation
    const dateOfCreation = new Date().toISOString();
  
    // Combine formState, accessRights, and dateOfCreation
    const accessGroupData = {
      ...formState,        // Spread the form state (includes groupName, application, etc.)
      accessRights,        // Add access rights 
      dateOfCreation,      // Add the creation date
    };
  
    // Store the data in localStorage
    localStorage.setItem('accessGroupData', JSON.stringify(accessGroupData));
  
    // Pass the data to the onSaveAndSubmit callback
    onSaveAndSubmit(accessGroupData);
  
    // Close the form/modal
    onClose();
  };
  
  const applicationsOptions = [
    { value: "Purchase", label: "Purchase" },
    { value: "Inventory", label: "Inventory" },
    { value: "Accounting", label: "Accounting" },
    { value: "CRM", label: "CRM" },
  ];

  const history = useHistory();

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const response = await fetch("/api/company"); // Adjust with your API endpoint
        const data = await response.json();
        if (data && data.companyName) {
          setFormState((prev) => ({
            ...prev,
            companyName: data.companyName, // Replace default with fetched company name
          }));
        }
      } catch (error) {
        console.error("Error fetching company name:", error);
      }
    };
    
    fetchCompanyName();
  }, []);

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
    option: (provided) => ({
      ...provided,
      cursor: "pointer",
    }),
  };

  return (
    <div className="registration-page fade-in">
      <div className="form-header">
        <div className="form-header-details">
          <div className="form-header-activity">
            <button className="header-btn">Access groups</button>
            
            <button className="header-btn active">Create</button>
          </div>
        </div>

        <div className="registration-form">
          <form className="registration-info" onSubmit={handleSubmit}>
            <div className="registration-header-info">
              <h2>Access Setup</h2>
              <div className="reg-action-btn">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" style={{ display: "flex", justifyContent: "center" }}>
                  Save
                </button>
              </div>
            </div>

            <div className="registration-contact-info-grouped">
              <div className="icon-upload" onClick={() => document.getElementById("imageInput").click()}>
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
                  <div className="icon-upload-text">
                    <img src={uploadIcon} alt="Upload" />
                    <span>icon</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Application</label>
                <Select
                  name="application"
                  placeholder="Select Application"
                  options={applicationsOptions}
                  styles={customStyles}
                  onChange={(selectedOption) => handleSelectChange("application", selectedOption)}
                />
              </div>

              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  name="groupName"
                  className="form-control"
                  placeholder="Enter Group Name"
                  value={formState.groupName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <h1 className="stamp" id="fetchedCompanyName">
                  {formState.companyName}
                </h1>
              </div>

            </div>
            <hr />
            <h2 className="heading">Access Rights</h2>
            <Table className="access-table">
              <thead>
                <tr>
                  <th></th>
                  <th>View</th>
                  <th>Edit</th>
                  <th>Approve</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(accessRights).map((right) => (
                  <tr key={right}>
                    <td>{right.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={accessRights[right].view}
                        onChange={() => handleCheckboxChange(right, 'view')}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={accessRights[right].edit}
                        onChange={() => handleCheckboxChange(right, 'edit')}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={accessRights[right].approve}
                        onChange={() => handleCheckboxChange(right, 'approve')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="reg-action-btn" id="reg-action-btn">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" style={{ display: "flex", justifyContent: "center" }}>
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
