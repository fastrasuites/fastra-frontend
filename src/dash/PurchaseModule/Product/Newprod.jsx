import React, { useState, useEffect } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import Select from "react-select";
import autosave from "../../../image/autosave.svg";
import "./Newprod.css";

export default function Newprod({ onClose, onSaveAndSubmit }) {
  const generateNewID = () => {
    const lastID = localStorage.getItem("lastGeneratedID");
    let newID = "PR00001";

    if (lastID) {
      const idNumber = parseInt(lastID.slice(2), 10) + 1;
      newID = "PR" + idNumber.toString().padStart(5, "0");
    }

    localStorage.setItem("lastGeneratedID", newID);
    return newID;
  };

  const [formState, setFormState] = useState({
    id: generateNewID(),
    name: "",
    unt: "",
    type: "",
    category: "",
    sp: "",
    cp: "",
    image: null, // New state for image
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormState((prev) => ({
        ...prev,
        image: reader.result, // Set image to base64 encoded string
      }));
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return `₦${value}`;
  };

  const handleSaveAndSubmit = (formData) => {
    try {
      const existingProducts =
        JSON.parse(localStorage.getItem("products")) || [];
      existingProducts.push(formData);
      localStorage.setItem("products", JSON.stringify(existingProducts));
      onSaveAndSubmit(formData);
    } catch (e) {
      if (e.name === "QuotaExceededError") {
        setError("Failed to save product. Storage limit exceeded.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formDataWithFormattedPrices = {
      ...formState,
      sp: formatCurrency(formState.sp),
      cp: formatCurrency(formState.cp),
      date: formState.date ? formState.date.toString() : new Date().toString(),
    };

    handleSaveAndSubmit(formDataWithFormattedPrices);
    onClose();
  };

  const unitOptions = [
    { value: "QTY", label: "Quantity" },
    { value: "LBS", label: "Pounds" },
    { value: "KG", label: "Kilograms" },
  ];

  const categoryOptions = [
    { value: "Electronics", label: "Electronics" },
    { value: "Furniture", label: "Furniture" },
    { value: "Clothing", label: "Clothing" },
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
    <div id="newprod" className={`newp ${showForm ? "fade-in" : "fade-out"}`}>
      <div className="newp1">
        <div className="newp2">
          <div className="newp2a">
            <p className="newphed">New Product</p>
            <div className="newpauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
          <div className="newp2b">
            <div className="newpbnav">
              <FaCaretLeft className="nr" />
              <div className="sep"></div>
              <FaCaretRight className="nr" />
            </div>
          </div>
        </div>
        <div className="newp3">
          <form className="newpform" onSubmit={handleSubmit}>
            <div className="newp3a">
              <p style={{ fontSize: "20px" }}>Basic Information</p>
              <button
                type="button"
                className="newp3but"
                onClick={onClose}
                style={{ marginTop: "1rem" }}
              >
                Cancel
              </button>
            </div>
            <div className="newp3b">
              <div className="newp3ba">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter the product name"
                  className="newp3cb"
                  value={formState.name}
                  onChange={handleChange}
                />
              </div>
              <div className="newp3ba">
                <label>Unit of Measure</label>
                <Select
                  options={unitOptions}
                  name="unt"
                  styles={customStyles}
                  value={unitOptions.find(
                    (option) => option.value === formState.unt
                  )}
                  onChange={(selectedOption) =>
                    setFormState((prev) => ({
                      ...prev,
                      unt: selectedOption ? selectedOption.value : "",
                    }))
                  }
                />
              </div>
              <div className="newp3ba">
                <label>Type</label>
                <input
                  type="text"
                  name="type"
                  placeholder="Goods"
                  className="newp3cb"
                  value={formState.type}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="newp3c">
              <div className="newp3ca">
                <label>Category</label>
                <Select
                  options={categoryOptions}
                  name="category"
                  styles={customStyles}
                  value={categoryOptions.find(
                    (option) => option.value === formState.category
                  )}
                  onChange={(selectedOption) =>
                    setFormState((prev) => ({
                      ...prev,
                      category: selectedOption ? selectedOption.value : "",
                    }))
                  }
                />
              </div>
              <div className="newp3ca">
                <label>Image</label>
                <input
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  onChange={handleImageChange}
                  className="newp3cb"
                  name="image"
                  required
                />
              </div>
            </div>
            <div className="newp3a2">
              <p style={{ fontSize: "20px" }}>Pricing</p>
            </div>
            <div className="newp3d">
              <div className="newp3da">
                <label>Cost Price</label>
                <input
                  type="text"
                  name="cp"
                  placeholder="₦0000"
                  className="newp3cb no-spin"
                  value={formState.cp}
                  onChange={handleChange}
                />
              </div>
              <div className="newp3da">
                <label>Selling Price</label>
                <input
                  type="text"
                  name="sp"
                  placeholder="₦0000"
                  className="newp3cb no-spin"
                  value={formState.sp}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="newp3e">
              <button
                type="submit"
                className="newp3btn"
                style={{ display: "flex", justifyContent: "center" }}
              >
                Create Product
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
