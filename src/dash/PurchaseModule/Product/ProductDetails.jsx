import React, { useState } from "react";
import "./ProductDetails.css";

export default function ProductDetails({ product, onClose, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState({ ...product });

  if (!product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormState((prev) => ({
          ...prev,
          image: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSave = () => {
    onSave(formState);
    setEditMode(false);
  };

  return (
    <div id="prodetails" className="prodet">
      <form className="prodet1">
        <div className="prodet2">
          <p style={{ fontSize: "20px" }}>Basic Information</p>
          <div className="prodet2a">
            <button type="button" className="prodet2but" onClick={onClose}>
              Cancel
            </button>
            {editMode ? (
              <button type="button" className="prodet2btn" onClick={handleSave}>
                Save
              </button>
            ) : (
              <button type="button" className="prodet2btn" onClick={() => setEditMode(true)}>
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="prodet3">
          <div className="prodet3a">
            <label>Product Name</label>
            {editMode ? (
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                className="editable-input"
              />
            ) : (
              <p className="prodet3b">{product.name}</p>
            )}
          </div>
          <div className="prodet3a">
            <label>Unit of Measure</label>
            {editMode ? (
              <input
                type="text"
                name="unit of measure"
                value={formState.unt}
                onChange={handleChange}
                className="editable-input"
              />
            ) : (
              <p className="prodet3b">{product.unt}</p>
            )}
          </div>
          <div className="prodet3a">
            <label>Type</label>
            {editMode ? (
              <input
                type="text"
                name="type"
                value={formState.type}
                onChange={handleChange}
                className="editable-input"
              />
            ) : (
              <p className="prodet3b">{product.type}</p>
            )}
          </div>
          <div className="prodet3a">
            <label>Category</label>
            {editMode ? (
              <input
                type="text"
                name="category"
                value={formState.category}
                onChange={handleChange}
                className="editable-input"
              />
            ) : (
              <p className="prodet3b">{product.category}</p>
            )}
          </div>
          <div className="prodet3a">
            <label>Image</label>
            {editMode ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="editable-input"
              />
            ) : (
              <img src={product.image} alt={product.name} className="prodet3b" style={{width: '50px', height: '50px'}}/>
            )}
          </div>        </div>
        <div>
          <div className="prodet1a2">
            <p style={{ fontSize: "20px" }}>Pricing</p>
          </div>
          <div className="prodet4">
            <div className="prodet4a">
              <label>Selling Price</label>
              {editMode ? (
                <input
                  type="text"
                  name="sp"
                  value={formState.sp}
                  onChange={handleChange}
                  className="editable-input"
                />
              ) : (
                <p className="prodet4b">{product.sp}</p>
              )}
            </div>
            <div className="prodet4a">
              <label>Cost Price</label>
              {editMode ? (
                <input
                  type="text"
                  name="cp"
                  value={formState.cp}
                  onChange={handleChange}
                  className="editable-input"
                />
              ) : (
                <p className="prodet4b">{product.cp}</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
